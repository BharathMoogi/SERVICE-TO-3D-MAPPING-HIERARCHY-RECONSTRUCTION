"""
End-to-end integration test for AtlasPipeline and all 6 deliverables.
"""

import json
from pathlib import Path
from scripts.generate_sample_data import generate_benchmark_dataset
from atlasai.pipeline import AtlasPipeline

def test_full_pipeline_execution_all_deliverables(tmp_path: Path):
    sample_dir = tmp_path / "sample_data"
    out_dir = tmp_path / "output"
    
    glb_file, steps_file = generate_benchmark_dataset(sample_dir)

    pipeline = AtlasPipeline()
    results = pipeline.run(glb_path=glb_file, steps_path=steps_file, output_dir=out_dir)

    assert len(results) == 6

    # Verify all 6 enterprise deliverable files exist
    assert (out_dir / "mapping.json").exists()
    assert (out_dir / "mesh_report.json").exists()
    assert (out_dir / "mesh_graph.json").exists()
    assert (out_dir / "benchmark.json").exists()
    assert (out_dir / "renamed_mapping.json").exists()
    assert (out_dir / "report.html").exists()

    # Validate mapping.json structure
    with open(out_dir / "mapping.json", "r", encoding="utf-8") as f:
        data = json.load(f)
        assert len(data) == 6
        assert "mesh" in data[0]
        assert "confidence" in data[0]
        assert "reason" in data[0]

    # Validate mesh_graph.json structure
    with open(out_dir / "mesh_graph.json", "r", encoding="utf-8") as f:
        graph_data = json.load(f)
        assert "total_nodes" in graph_data
        assert "edges" in graph_data

    # Validate benchmark.json structure
    with open(out_dir / "benchmark.json", "r", encoding="utf-8") as f:
        bench_data = json.load(f)
        assert "performance_metrics" in bench_data
        assert "total_execution_time_ms" in bench_data["performance_metrics"]
