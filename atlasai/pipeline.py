"""
AtlasAI Master Pipeline Orchestrator
Coordinates all 15 Commercial AI Engineering Copilot modules:
1. Document Intelligence Engine
2. Engineering Knowledge Extractor
3. Parts Cross Reference Engine
4. Multi-Document RAG Vector DB
5. Unified Engineering Knowledge Graph
6. Multi-Doc Core AI Reasoning Engine
7. AI Engineering Copilot
8. Bidirectional Doc-to-3D Linker
9. Component Lifecycle Timeline
10. Global Engineering Search Engine
11. Enterprise Deliverables Exporter
"""

import logging
from pathlib import Path
from typing import List, Dict, Any

from atlasai.engines.glb_analyzer import GLBAnalysisEngine
from atlasai.engines.mesh_intelligence import MeshIntelligenceEngine
from atlasai.engines.instruction_intelligence import InstructionIntelligenceEngine
from atlasai.engines.semantic_knowledge import SemanticKnowledgeEngine
from atlasai.engines.ai_reasoning import AIReasoningEngine
from atlasai.engines.core_reasoning_engine import CoreAIReasoningEngine
from atlasai.engines.output_generator import OutputGeneratorEngine
from atlasai.engines.auto_rename import MeshAutoRenameEngine
from atlasai.engines.visual_report import VisualReportEngine
from atlasai.utils.benchmark import BenchmarkTracker

# Module 1 - 15 Engines
from atlasai.engines.document_intelligence import DocumentIntelligenceEngine
from atlasai.engines.engineering_knowledge import EngineeringKnowledgeExtractor
from atlasai.engines.parts_cross_reference import PartsCrossReferenceEngine
from atlasai.engines.document_rag import DocumentRAGEngine
from atlasai.engines.engineering_knowledge_graph import UnifiedEngineeringGraphEngine
from atlasai.engines.copilot import EngineeringCopilotEngine
from atlasai.engines.doc_3d_linker import BidirectionalDoc3DLinker
from atlasai.engines.lifecycle import ComponentLifecycleEngine
from atlasai.engines.global_search import GlobalEngineeringSearchEngine
from atlasai.engines.export_engine import EnterpriseExportEngine
from atlasai.domain.models import StepMappingResult

logger = logging.getLogger("AtlasAI.Pipeline")


class AtlasPipeline:
    def __init__(self, confidence_threshold: float = 0.65):
        self.glb_analyzer = GLBAnalysisEngine()
        self.mesh_intel = MeshIntelligenceEngine()
        self.instruction_intel = InstructionIntelligenceEngine()
        self.semantic_knowledge = SemanticKnowledgeEngine()
        self.ai_reasoning = AIReasoningEngine()
        self.core_reasoning = CoreAIReasoningEngine(
            self.semantic_knowledge,
            self.ai_reasoning,
            confidence_threshold=confidence_threshold
        )
        self.output_gen = OutputGeneratorEngine()
        self.auto_rename = MeshAutoRenameEngine()
        self.visual_report = VisualReportEngine()
        self.benchmark = BenchmarkTracker()

        # Multi-Doc Copilot Engines
        self.doc_intel = DocumentIntelligenceEngine()
        self.entity_extractor = EngineeringKnowledgeExtractor()
        self.xref_engine = PartsCrossReferenceEngine()
        self.rag_engine = DocumentRAGEngine()
        self.graph_engine = UnifiedEngineeringGraphEngine()
        self.export_engine = EnterpriseExportEngine()

    def run(self, glb_path: Path, steps_path: Path, output_dir: Path) -> List[StepMappingResult]:
        """Runs full 15-module AtlasAI pipeline."""
        logger.info("==================================================================")
        logger.info("       STARTING ATLASAI COMMERCIAL AI COPILOT PIPELINE           ")
        logger.info("==================================================================")

        # Step 1: GLB CAD Model Analysis
        t_glb = self.benchmark.time_function(self.glb_analyzer.load_and_analyze, glb_path)
        repository = t_glb["result"]
        self.benchmark.record("glb_loading_time_ms", t_glb["duration_ms"])

        # Step 2: Mesh Intelligence Decoration
        self.mesh_intel.analyze_repository(repository)

        # Step 3: Service Instruction Parsing
        instructions = self.instruction_intel.load_and_parse_steps(steps_path)

        # Step 4: Multi-Doc Intelligence & Cross-Reference Ingestion
        pkg_dir = steps_path.parent
        sections = self.doc_intel.ingest_engineering_package(pkg_dir)
        entities = self.entity_extractor.extract_entities(sections)
        xref_list = self.xref_engine.load_cross_reference_catalog(pkg_dir / "parts_xref.csv")
        self.rag_engine.build_vector_index(sections)

        # Step 5: Build Unified Engineering Knowledge Graph
        self.graph_engine.build_unified_graph(xref_list, entities)
        self.graph_engine.export_graph_json(output_dir / "engineering_graph.json")

        # Step 6: Build Semantic Index
        self.semantic_knowledge.build_index(repository)

        # Step 7: Core AI Reasoning over Service Steps
        mapping_results: List[StepMappingResult] = []
        for step in instructions:
            logger.info(f"Processing Step {step.step_number}: '{step.raw_instruction}'")
            res = self.core_reasoning.process_instruction(step, repository)
            mapping_results.append(res)

        # Step 8: Generate Deliverables
        self.output_gen.export_all_artifacts(mapping_results, repository, self.benchmark, output_dir)
        self.export_engine.export_all_deliverables(output_dir, mapping_results, entities, xref_list)

        total_ms = self.benchmark.stop()
        self.benchmark.export_benchmark_json(output_dir / "benchmark.json")

        logger.info("==================================================================")
        logger.info("            ATLASAI PIPELINE COMPLETED SUCCESSFULLY               ")
        logger.info("==================================================================")
        return mapping_results
