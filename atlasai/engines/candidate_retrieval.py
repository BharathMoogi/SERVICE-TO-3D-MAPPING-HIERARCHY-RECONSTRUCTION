"""
Module 5: Candidate Retrieval Engine
Performs multi-criteria candidate retrieval (Top 10) using spatial location, vector embeddings,
bounding box proportions, and hierarchy rules.
"""

import logging
from typing import List, Tuple
import numpy as np

from atlasai.domain.models import MeshMetadata, ParsedInstruction, CandidateScore
from atlasai.domain.repository import MeshRepository
from atlasai.engines.semantic_knowledge import SemanticKnowledgeEngine
from atlasai.config.settings import get_settings

logger = logging.getLogger("AtlasAI.CandidateRetrieval")

class CandidateRetrievalEngine:
    """Filter and pre-ranks mesh candidates using geometric spatial distance, semantic vectors, and tag matching."""

    def __init__(self, semantic_engine: SemanticKnowledgeEngine, top_k: int | None = None):
        self.semantic_engine = semantic_engine
        self.settings = get_settings()
        self.top_k = top_k or self.settings.top_k_candidates

    def retrieve_candidates(
        self,
        parsed_instruction: ParsedInstruction,
        repository: MeshRepository
    ) -> List[CandidateScore]:
        """Returns top K CandidateScore objects for a given service instruction."""
        query_vec = self.semantic_engine.encode_instruction(parsed_instruction)
        global_min, global_max = repository.get_global_bounds()

        candidates: List[CandidateScore] = []

        for mesh in repository.list_all():
            sem_score = self.semantic_engine.compute_similarity(query_vec, mesh.mesh_id)
            geom_score = self._compute_geometry_match(parsed_instruction, mesh)
            spatial_score = self._compute_spatial_match(parsed_instruction, mesh, global_min, global_max)
            hier_score = self._compute_hierarchy_score(mesh)

            # Combined preliminary retrieval score
            preliminary_score = (
                0.45 * sem_score +
                0.30 * geom_score +
                0.15 * spatial_score +
                0.10 * hier_score
            )

            cand = CandidateScore(
                mesh_id=mesh.mesh_id,
                mesh_description=mesh.auto_description,
                semantic_score=round(float(sem_score), 4),
                geometry_score=round(float(geom_score), 4),
                spatial_score=round(float(spatial_score), 4),
                hierarchy_score=round(float(hier_score), 4),
                final_confidence=round(float(preliminary_score), 4),
            )
            candidates.append(cand)

        # Sort descending by preliminary score and take top K
        candidates.sort(key=lambda c: c.final_confidence, reverse=True)
        top_candidates = candidates[:self.top_k]

        logger.info(
            f"Candidate Retrieval Engine selected top {len(top_candidates)} candidates for "
            f"Step {parsed_instruction.step_id} ('{parsed_instruction.raw_instruction}')"
        )
        return top_candidates

    def _compute_geometry_match(self, instruction: ParsedInstruction, mesh: MeshMetadata) -> float:
        """Evaluates match between instruction attribute hints and mesh geometric shape/tags."""
        match_count = 0
        total_hints = max(1, len(instruction.attribute_hints))

        mesh_tags_lower = [t.lower() for t in mesh.semantic_tags] + [mesh.geometric_shape.lower()]

        for hint in instruction.attribute_hints:
            hint_lower = hint.lower()
            if any(hint_lower in tag or tag in hint_lower for tag in mesh_tags_lower):
                match_count += 1

        # Check target object words match
        target_words = [w.lower() for w in instruction.target_object.split() if len(w) > 2]
        for w in target_words:
            if any(w in tag for tag in mesh_tags_lower):
                match_count += 1.5

        return min(1.0, float(match_count / (total_hints + 1.0)))

    def _compute_spatial_match(
        self,
        instruction: ParsedInstruction,
        mesh: MeshMetadata,
        global_min: np.ndarray,
        global_max: np.ndarray
    ) -> float:
        """Evaluates whether mesh world position matches instruction positional cues (bottom, top, etc.)."""
        if not instruction.position_cue:
            return 0.5  # Neutral score

        height = global_max[2] - global_min[2]
        if height <= 0:
            return 0.5

        rel_z = (mesh.world_position.z - global_min[2]) / height

        pos = instruction.position_cue.lower()
        if pos == "bottom" or pos == "lower":
            # Higher score if in lower 30% of assembly
            return float(max(0.0, 1.0 - rel_z * 2.5))
        elif pos == "top" or pos == "upper":
            # Higher score if in top 30% of assembly
            return float(max(0.0, rel_z * 2.0 - 1.0))
        elif pos == "internal" or pos == "inside":
            # Higher score if close to assembly center
            rel_x = (mesh.world_position.x - global_min[0]) / max(1e-4, global_max[0] - global_min[0])
            rel_y = (mesh.world_position.y - global_min[1]) / max(1e-4, global_max[1] - global_min[1])
            dist_center = np.sqrt((rel_x - 0.5)**2 + (rel_y - 0.5)**2 + (rel_z - 0.5)**2)
            return float(max(0.0, 1.0 - dist_center * 1.5))

        return 0.5

    def _compute_hierarchy_score(self, mesh: MeshMetadata) -> float:
        """Leaf meshes or sub-assembly nodes are prioritized over root scene containers."""
        if len(mesh.children_ids) == 0:
            return 1.0  # Atomic mesh leaf
        elif len(mesh.children_ids) < 5:
            return 0.7  # Small sub-assembly
        else:
            return 0.3  # Large composite node
