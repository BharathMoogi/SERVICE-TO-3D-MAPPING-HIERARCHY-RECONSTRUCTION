"""
Module 6: AI Reasoning Engine
Abstract provider architecture for Gemini LLM reasoning and local heuristic AI reasoning fallback.
Constructs rich domain prompts and evaluates semantic correspondence between instructions and candidates.
"""

import json
import logging
import re
from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional

from atlasai.domain.models import ParsedInstruction, CandidateScore, MeshMetadata
from atlasai.domain.repository import MeshRepository
from atlasai.config.settings import get_settings

logger = logging.getLogger("AtlasAI.AIReasoning")

class LLMProviderBase(ABC):
    """Abstract base class for LLM semantic reasoning providers following SOLID principles."""

    @abstractmethod
    def evaluate_candidate(
        self,
        instruction: ParsedInstruction,
        candidate: CandidateScore,
        mesh: MeshMetadata,
        neighbors: List[MeshMetadata]
    ) -> Dict[str, Any]:
        """Evaluates whether mesh candidate represents the instruction component. Returns structured JSON dict."""
        pass

class GeminiLLMProvider(LLMProviderBase):
    """Google Gemini AI reasoning provider using official google-genai SDK."""

    def __init__(self, api_key: str, model_name: str = "gemini-2.5-flash"):
        self.api_key = api_key
        self.model_name = model_name
        self.client = None
        self._init_client()

    def _init_client(self) -> None:
        if not self.api_key:
            logger.info("No Gemini API key provided. GeminiLLMProvider will defer to fallback.")
            return

        try:
            from google import genai
            self.client = genai.Client(api_key=self.api_key)
            logger.info(f"Initialized Gemini Client with model: {self.model_name}")
        except Exception as e:
            logger.warning(f"Failed to initialize google-genai client ({e}).")

    def evaluate_candidate(
        self,
        instruction: ParsedInstruction,
        candidate: CandidateScore,
        mesh: MeshMetadata,
        neighbors: List[MeshMetadata]
    ) -> Dict[str, Any]:
        if not self.client:
            raise RuntimeError("Gemini client not initialized or API key missing.")

        prompt = self._build_reasoning_prompt(instruction, mesh, neighbors)

        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config={
                    "response_mime_type": "application/json"
                }
            )
            data = json.loads(response.text)
            return data
        except Exception as e:
            logger.error(f"Gemini API request failed for {mesh.mesh_id}: {e}")
            raise e

    def _build_reasoning_prompt(
        self,
        instruction: ParsedInstruction,
        mesh: MeshMetadata,
        neighbors: List[MeshMetadata]
    ) -> str:
        neighbor_names = [f"{n.mesh_id} ({n.geometric_shape})" for n in neighbors[:4]]
        bb = mesh.bounding_box

        prompt = f"""
You are an expert 3D Computer Vision and CAD Maintenance AI.
Analyze whether the following 3D CAD mesh node corresponds to the engineering maintenance instruction.

INSTRUCTION DATA:
- Step: {instruction.step_id}
- Natural Language Instruction: "{instruction.raw_instruction}"
- Target Component: "{instruction.target_object}"
- Action: "{instruction.action}"
- Position Cue: "{instruction.position_cue}"
- Attributes: {instruction.attribute_hints}

CANDIDATE MESH DATA:
- Mesh ID: {mesh.mesh_id}
- Inferred Shape: {mesh.geometric_shape}
- Spatial Zone: {mesh.spatial_zone}
- World Position: ({mesh.world_position.x:.2f}, {mesh.world_position.y:.2f}, {mesh.world_position.z:.2f})
- Dimensions (X, Y, Z): ({bb.dimensions.x:.2f}m, {bb.dimensions.y:.2f}m, {bb.dimensions.z:.2f}m)
- Volume: {bb.volume:.6f} m^3
- Surface Area: {bb.surface_area:.6f} m^2
- Material: {mesh.material_name}
- Semantic Tags: {mesh.semantic_tags}
- Nearby Objects: {neighbor_names}

TASK:
Determine if this mesh represents the target component.
Return ONLY valid JSON matching this schema:
{{
  "match": true | false,
  "confidence": float between 0.0 and 1.0,
  "reason": ["bullet point 1", "bullet point 2", "bullet point 3"],
  "alternatives": ["Mesh_XXX", "Mesh_YYY"]
}}
"""
        return prompt

class HeuristicReasoningProvider(LLMProviderBase):
    """Deterministic local AI reasoning provider for offline execution and fast verification."""

    def evaluate_candidate(
        self,
        instruction: ParsedInstruction,
        candidate: CandidateScore,
        mesh: MeshMetadata,
        neighbors: List[MeshMetadata]
    ) -> Dict[str, Any]:
        reasons = []

        target = instruction.target_object.lower()
        tags = [t.lower() for t in mesh.semantic_tags]
        bb = mesh.bounding_box

        # Check shape match
        if mesh.geometric_shape in tags or any(h in tags for h in instruction.attribute_hints):
            reasons.append(f"Geometry matches expected '{mesh.geometric_shape}' profile.")

        # Check spatial position match
        if instruction.position_cue and instruction.position_cue.lower() in mesh.spatial_zone.lower():
            reasons.append(f"Located in '{mesh.spatial_zone.replace('_', ' ')}' as specified by instruction.")

        # Check semantic correlation
        if candidate.semantic_score > 0.4:
            reasons.append(f"High semantic vector similarity ({candidate.semantic_score:.2f}) to instruction keywords.")

        # Neighbor context
        if neighbors:
            reasons.append(f"Positioned adjacent to sub-assembly components ({neighbors[0].mesh_id}).")

        match_decision = candidate.final_confidence > 0.45 or len(reasons) >= 2
        confidence = float(min(0.98, max(0.20, candidate.final_confidence * 1.1)))

        return {
            "match": match_decision,
            "confidence": round(confidence, 2),
            "reason": reasons if reasons else ["General structural alignment within assembly."],
            "alternatives": [n.mesh_id for n in neighbors[:2]]
        }

class AIReasoningEngine:
    """Main orchestrator for AI reasoning with provider fallback strategy."""

    def __init__(self, provider: Optional[LLMProviderBase] = None):
        self.settings = get_settings()
        if provider:
            self.provider = provider
        elif self.settings.gemini_api_key:
            try:
                self.provider = GeminiLLMProvider(api_key=self.settings.gemini_api_key, model_name=self.settings.gemini_model)
            except Exception:
                self.provider = HeuristicReasoningProvider()
        else:
            self.provider = HeuristicReasoningProvider()

    def evaluate_candidates(
        self,
        instruction: ParsedInstruction,
        candidates: List[CandidateScore],
        repository: MeshRepository
    ) -> List[CandidateScore]:
        """Evaluates top candidates and updates candidate scores with LLM reasoning feedback."""
        evaluated: List[CandidateScore] = []

        for cand in candidates:
            mesh = repository.get(cand.mesh_id)
            if not mesh:
                continue

            neighbors = repository.get_neighbors(cand.mesh_id, radius=0.8)

            try:
                result = self.provider.evaluate_candidate(instruction, cand, mesh, neighbors)
                cand.llm_score = float(result.get("confidence", 0.5))
                cand.reasoning_points = result.get("reason", [])
            except Exception as e:
                logger.warning(f"LLM Provider error for candidate {cand.mesh_id}: {e}. Falling back to Heuristic AI.")
                fallback = HeuristicReasoningProvider()
                result = fallback.evaluate_candidate(instruction, cand, mesh, neighbors)
                cand.llm_score = float(result.get("confidence", 0.5))
                cand.reasoning_points = result.get("reason", [])

            evaluated.append(cand)

        return evaluated
