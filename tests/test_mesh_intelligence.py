"""
Unit tests for Mesh Intelligence Engine
"""

import trimesh
from pathlib import Path
from atlasai.engines.glb_analyzer import GLBAnalysisEngine
from atlasai.engines.mesh_intelligence import MeshIntelligenceEngine

def test_mesh_intelligence_classification(tmp_path: Path):
    # Create flat plate geometry
    plate = trimesh.creation.box(extents=[0.8, 0.6, 0.02])
    glb_file = tmp_path / "plate.glb"
    plate.export(str(glb_file))

    analyzer = GLBAnalysisEngine()
    repo = analyzer.load_and_analyze(glb_file)

    intelligence = MeshIntelligenceEngine()
    intelligence.analyze_repository(repo)

    mesh = repo.list_all()[0]
    assert mesh.geometric_shape == "large_flat_plate"
    assert "flat" in mesh.semantic_tags
    assert len(mesh.auto_description) > 10
