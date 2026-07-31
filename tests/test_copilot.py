"""
Unit tests for AtlasAI Multi-Document Engineering Copilot Engines:
- Document Intelligence Engine
- Engineering Knowledge Extractor
- Parts Cross Reference Engine
- Document RAG Engine
- Engineering Copilot Engine
- Component Lifecycle Engine
- Global Engineering Search Engine
"""

import pytest
from pathlib import Path

from atlasai.engines.document_intelligence import DocumentIntelligenceEngine
from atlasai.engines.engineering_knowledge import EngineeringKnowledgeExtractor
from atlasai.engines.parts_cross_reference import PartsCrossReferenceEngine
from atlasai.engines.document_rag import DocumentRAGEngine
from atlasai.engines.copilot import EngineeringCopilotEngine
from atlasai.engines.lifecycle import ComponentLifecycleEngine
from atlasai.engines.global_search import GlobalEngineeringSearchEngine
from scripts.generate_sample_data import generate_benchmark_dataset


def test_copilot_and_multi_doc_engines(tmp_path: Path):
    # 1. Generate sample engineering package
    glb_file, steps_file = generate_benchmark_dataset(tmp_path)
    pkg_dir = tmp_path

    # 2. Test Document Intelligence & Extraction
    doc_intel = DocumentIntelligenceEngine()
    sections = doc_intel.ingest_engineering_package(pkg_dir)
    assert len(sections) >= 3

    entity_extractor = EngineeringKnowledgeExtractor()
    entities = entity_extractor.extract_entities(sections)
    assert len(entities) >= 5

    # 3. Test Parts Cross Reference
    xref_engine = PartsCrossReferenceEngine()
    xref_list = xref_engine.load_cross_reference_catalog(pkg_dir / "parts_xref.csv")
    assert len(xref_list) >= 5

    match_mesh = xref_engine.get_by_mesh("Mesh_231")
    assert match_mesh is not None
    assert match_mesh.part_number == "PCB-MAIN-880"

    # 4. Test Document RAG Vector Search
    rag_engine = DocumentRAGEngine()
    rag_engine.build_vector_index(sections)
    chunks = rag_engine.retrieve_relevant_chunks("circuit board torque", top_k=2)
    assert len(chunks) > 0

    # 5. Test Engineering Copilot Engine
    copilot = EngineeringCopilotEngine(xref_engine, rag_engine)
    res1 = copilot.answer_query("Where is the circuit board?")
    assert len(res1.highlight_meshes) > 0
    assert "Mesh_231" in res1.highlight_meshes

    res2 = copilot.answer_query("Which part is replaced in work order WO-7741?")
    assert "WO-7741" in res2.answer
    assert "Mesh_032" in res2.highlight_meshes

    # 6. Test Component Lifecycle Engine
    lifecycle_engine = ComponentLifecycleEngine(xref_engine)
    lc = lifecycle_engine.get_lifecycle_for_mesh("Mesh_231")
    assert lc.mesh_id == "Mesh_231"
    assert len(lc.events) >= 2

    # 7. Test Global Engineering Search
    global_search = GlobalEngineeringSearchEngine(xref_engine, rag_engine)
    results = global_search.search("EL-DRW-900")
    assert len(results) > 0
    assert results[0].mesh_id == "Mesh_032"
