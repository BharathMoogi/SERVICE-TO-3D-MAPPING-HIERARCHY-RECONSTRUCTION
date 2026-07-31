"""
AtlasPipeline Orchestrator
Coordinates the end-to-end execution of the 15-Stage Core AI Reasoning Engine and 6-file deliverable exports.
"""

import json
import logging
from pathlib import Path
from typing import List, Dict, Any

from atlasai.config.settings import Settings, get_settings
from atlasai.domain.models import MappingResult, ParsedInstruction
from atlasai.domain.repository import MeshRepository

from atlasai.engines.glb_analyzer import GLBAnalysisEngine
from atlasai.engines.mesh_intelligence import MeshIntelligenceEngine
from atlasai.engines.instruction_intelligence import InstructionIntelligenceEngine
from atlasai.engines.semantic_knowledge import SemanticKnowledgeEngine
from atlasai.engines.ai_reasoning import AIReasoningEngine
from atlasai.engines.core_reasoning_engine import CoreAIReasoningEngine
from atlasai.engines.output_generator import OutputGenerator
from atlasai.utils.benchmark import BenchmarkTracker, StageTimer

logger = logging.getLogger("AtlasAI.Pipeline")

class AtlasPipeline:
    """Master Pipeline for Enterprise Service-to-3D Digital Twin Mapping Engine."""

    def __init__(self, settings: Settings | None = None):
        self.settings = settings or get_settings()

        self.glb_analyzer = GLBAnalysisEngine()
        self.mesh_intelligence = MeshIntelligenceEngine()
        self.instruction_intelligence = InstructionIntelligenceEngine()
        self.semantic_knowledge = SemanticKnowledgeEngine(model_name=self.settings.embedding_model_name)
        self.ai_reasoning = AIReasoningEngine()

        self.core_reasoning_engine = CoreAIReasoningEngine(
            semantic_engine=self.semantic_knowledge,
            ai_reasoning_engine=self.ai_reasoning,
            confidence_threshold=0.65
        )
        self.output_generator = OutputGenerator()

    def run(
        self,
        glb_path: str | Path,
        steps_path: str | Path,
        output_dir: str | Path = "output"
    ) -> List[MappingResult]:
        """Executes full 15-stage AtlasAI pipeline, returning mapping results and generating all 6 deliverables."""
        logger.info("==================================================================")
        logger.info("       STARTING ATLASAI INTEL ENGINE SERVICE-TO-3D MAPPING        ")
        logger.info("==================================================================")

        out_path = Path(output_dir)
        out_path.mkdir(parents=True, exist_ok=True)

        benchmark = BenchmarkTracker()
        benchmark.start_total()

        # Stage 1: GLB Analysis Engine
        with StageTimer(benchmark, "glb_loading_time_ms"):
            repository: MeshRepository = self.glb_analyzer.load_and_analyze(glb_path)

        # Stage 2: Mesh Intelligence Engine
        with StageTimer(benchmark, "mesh_intelligence_time_ms"):
            self.mesh_intelligence.analyze_repository(repository)

        # Stage 3: Instruction Intelligence Engine
        steps_data = self._load_steps_json(steps_path)
        parsed_instructions: List[ParsedInstruction] = self.instruction_intelligence.parse_steps_list(steps_data)

        # Stage 4: Dense Vector Indexing
        with StageTimer(benchmark, "embedding_indexing_time_ms"):
            self.semantic_knowledge.build_index(repository)

        mapping_results: List[MappingResult] = []

        # Execute 15-Stage Core Reasoning Engine per Instruction
        for parsed_step in parsed_instructions:
            logger.info(f"Processing Step {parsed_step.step_id}: '{parsed_step.raw_instruction}'")

            with StageTimer(benchmark, "llm_reasoning_time_ms"):
                mapping_res = self.core_reasoning_engine.process_instruction(parsed_step, repository)

            mapping_results.append(mapping_res)

        benchmark.stop_total()

        # Stage 9: Output Generator (Exports all 6 deliverables)
        generated_files = self.output_generator.export_all_artifacts(
            mapping_results=mapping_results,
            repository=repository,
            benchmark=benchmark,
            output_dir=out_path
        )

        logger.info("==================================================================")
        logger.info("                 ATLASAI PIPELINE COMPLETED                       ")
        for fname, fpath in generated_files.items():
            logger.info(f" -> Deliverable Artifact ({fname}): {fpath}")
        logger.info("==================================================================")

        return mapping_results

    def _load_steps_json(self, steps_path: str | Path) -> List[Any]:
        path = Path(steps_path)
        if not path.exists():
            raise FileNotFoundError(f"Steps file not found at: {path}")

        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)

        if isinstance(data, list):
            return data
        elif isinstance(data, dict) and "steps" in data:
            return data["steps"]
        else:
            raise ValueError(f"Invalid format in steps.json: expected list or dict with 'steps' key.")
