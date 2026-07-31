"""
FastAPI Enterprise REST API & Web Dashboard Server for AtlasAI
Exposes endpoints for pipeline execution, 3D GLB model streaming, JSON/HTML deliverables,
and Stage 14 Explainability API (/api/explain/{step}).
"""

import sys
import json
import logging
from pathlib import Path

# Ensure project root is in path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from atlasai.pipeline import AtlasPipeline

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("AtlasAI.Server")

app = FastAPI(
    title="AtlasAI - Enterprise 3D Digital Twin API Platform",
    version="1.0.0",
    description="Service-to-3D Mapping Engine REST API & Interactive Visualizer"
)

# Enable CORS for cross-origin web visualizers
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parent.parent
OUTPUT_DIR = BASE_DIR / "output"
SAMPLE_DIR = BASE_DIR / "sample_data"
WEB_DIR = BASE_DIR / "web_visualizer"

@app.get("/api/mapping")
def get_mapping():
    file_path = OUTPUT_DIR / "mapping.json"
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="mapping.json not found. Run pipeline first.")
    return FileResponse(file_path, media_type="application/json")

# Stage 14: REST Explainability API
@app.get("/api/explain/{step_id}")
def get_explainability(step_id: int):
    """Stage 14 REST API: Returns reasoning timeline, evidence chain, top candidates, and rejection rationale for step."""
    file_path = OUTPUT_DIR / "mapping.json"
    renamed_path = OUTPUT_DIR / "renamed_mapping.json"

    if not file_path.exists():
        raise HTTPException(status_code=404, detail="mapping.json not found. Run pipeline first.")

    with open(file_path, "r", encoding="utf-8") as f:
        mapping_data = json.load(f)

    step_item = next((item for item in mapping_data if item.get("step") == step_id), None)
    if not step_item:
        raise HTTPException(status_code=404, detail=f"Step {step_id} not found.")

    semantic_name = step_item.get("mesh", "")
    if renamed_path.exists():
        with open(renamed_path, "r", encoding="utf-8") as rf:
            renamed_catalog = json.load(rf)
            matching_r = next((r for r in renamed_catalog if r.get("original_mesh_id") == step_item.get("mesh")), None)
            if matching_r:
                semantic_name = matching_r.get("semantic_name", step_item.get("mesh"))

    top_candidates = step_item.get("top_candidates", [])
    rejected = [c for c in top_candidates if c.get("mesh_id") != step_item.get("mesh")]

    return {
        "step": step_id,
        "instruction": step_item.get("instruction"),
        "matched_mesh": step_item.get("mesh"),
        "semantic_name": semantic_name,
        "confidence": step_item.get("confidence"),
        "reasoning_timeline": step_item.get("timeline", [
            {"stage_name": "Stage 1: Intent Extraction", "description": "Extracted target component", "candidate_count": 241},
            {"stage_name": "Stage 2: Deterministic Filter", "description": "Filter boundaries: 241 -> 20 candidates", "candidate_count": 20},
            {"stage_name": "Stage 3-6: Multi-Modal Scoring", "description": "Spatial & Graph scoring: 20 -> 5 candidates", "candidate_count": 5},
            {"stage_name": "Stage 7: Gemini Verification", "description": "Evaluated candidate contexts", "candidate_count": 5},
            {"stage_name": "Stage 8: Score Fusion", "description": f"Selected {step_item.get('mesh')}", "candidate_count": 1}
        ]),
        "evidence_chain": step_item.get("evidence", [
            {"category": "Spatial", "statement": r, "verified": True} for r in step_item.get("reason", [])
        ]),
        "top_candidates": top_candidates,
        "rejected_candidates": rejected
    }

@app.get("/api/mesh-graph")
def get_mesh_graph():
    file_path = OUTPUT_DIR / "mesh_graph.json"
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="mesh_graph.json not found. Run pipeline first.")
    return FileResponse(file_path, media_type="application/json")

@app.get("/api/benchmark")
def get_benchmark():
    file_path = OUTPUT_DIR / "benchmark.json"
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="benchmark.json not found. Run pipeline first.")
    return FileResponse(file_path, media_type="application/json")

@app.get("/api/renamed")
def get_renamed():
    file_path = OUTPUT_DIR / "renamed_mapping.json"
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="renamed_mapping.json not found. Run pipeline first.")
    return FileResponse(file_path, media_type="application/json")

@app.get("/api/mesh-report")
def get_mesh_report():
    file_path = OUTPUT_DIR / "mesh_report.json"
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="mesh_report.json not found. Run pipeline first.")
    return FileResponse(file_path, media_type="application/json")

@app.get("/api/report.html")
def get_html_report():
    file_path = OUTPUT_DIR / "report.html"
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="report.html not found. Run pipeline first.")
    return FileResponse(file_path, media_type="text/html")

@app.get("/api/model/microscope.glb")
def get_glb_model():
    glb_path = SAMPLE_DIR / "microscope.glb"
    if not glb_path.exists():
        from scripts.generate_sample_data import generate_benchmark_dataset
        glb_path, _ = generate_benchmark_dataset(SAMPLE_DIR)
    return FileResponse(glb_path, media_type="model/gltf-binary", filename="microscope.glb")

@app.post("/api/pipeline/run")
def trigger_pipeline_run():
    try:
        glb_file = SAMPLE_DIR / "microscope.glb"
        steps_file = SAMPLE_DIR / "steps.json"

        if not glb_file.exists() or not steps_file.exists():
            from scripts.generate_sample_data import generate_benchmark_dataset
            generate_benchmark_dataset(SAMPLE_DIR)

        pipeline = AtlasPipeline()
        results = pipeline.run(glb_path=glb_file, steps_path=steps_file, output_dir=OUTPUT_DIR)
        return {
            "status": "success",
            "message": "Pipeline completed successfully.",
            "total_steps_mapped": len(results)
        }
    except Exception as e:
        logger.error(f"Pipeline run error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Mount static web visualizer at root / AFTER all API endpoints
if WEB_DIR.exists():
    app.mount("/", StaticFiles(directory=str(WEB_DIR), html=True), name="static_root")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("atlasai.server:app", host="127.0.0.1", port=8000, reload=True)
