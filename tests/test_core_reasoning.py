"""
Unit tests for Core AI Reasoning Engine (15 Stages & Self-Validation Loop)
"""

import pytest
import trimesh
from pathlib import Path

from atlasai.engines.glb_analyzer import GLBAnalysisEngine
from atlasai.engines.mesh_intelligence import MeshIntelligenceEngine
from atlasai.engines.instruction_intelligence import InstructionIntelligenceEngine
from atlasai.engines.semantic_knowledge import SemanticKnowledgeEngine
from atlasai.engines.ai_reasoning import AIReasoningEngine
from atlasai.engines.core_reasoning_engine import CoreAIReasoningEngine

def test_core_reasoning_engine(tmp_path: Path):
    box = trimesh.creation.box(extents=[0.8, 0.6, 0.02])
    glb_file = tmp_path / "test_pcb.glb"
    box.export(str(glb_file))

    analyzer = GLBAnalysisEngine()
    repo = analyzer.load_and_analyze(glb_file)

    mesh_intel = MeshIntelligenceEngine()
    mesh_intel.analyze_repository(repo)

    instr_intel = InstructionIntelligenceEngine()
    parsed_instr = instr_intel.parse_instruction(1, "Remove the bottom circuit board")

    sem_engine = SemanticKnowledgeEngine()
    sem_engine.build_index(repo)

    ai_reasoning = AIReasoningEngine()
    core_engine = CoreAIReasoningEngine(sem_engine, ai_reasoning, confidence_threshold=0.65)

    result = core_engine.process_instruction(parsed_instr, repo)

    assert result.step == 1
    assert result.mesh == "Mesh_001"
    assert result.confidence > 0.4
    assert len(result.timeline) >= 4
    assert len(result.evidence) >= 2
