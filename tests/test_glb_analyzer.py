"""
Unit tests for GLB Analysis Engine
"""

import pytest
import trimesh
from pathlib import Path
from atlasai.engines.glb_analyzer import GLBAnalysisEngine
from atlasai.domain.repository import MeshRepository

def test_glb_analysis_engine_single_mesh(tmp_path: Path):
    box = trimesh.creation.box(extents=[1.0, 0.5, 0.2])
    glb_file = tmp_path / "test_box.glb"
    box.export(str(glb_file))

    engine = GLBAnalysisEngine()
    repo = engine.load_and_analyze(glb_file)

    assert isinstance(repo, MeshRepository)
    assert len(repo) == 1
    
    mesh = repo.list_all()[0]
    assert mesh.mesh_id == "Mesh_001"
    assert pytest.approx(mesh.bounding_box.dimensions.x, rel=1e-2) == 1.0
    assert pytest.approx(mesh.bounding_box.dimensions.y, rel=1e-2) == 0.5
    assert pytest.approx(mesh.bounding_box.dimensions.z, rel=1e-2) == 0.2
