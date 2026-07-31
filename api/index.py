"""
Vercel Serverless Entrypoint for AtlasAI FastAPI Engine.
Self-contained: no heavy imports (no trimesh, networkx, scipy).
All heavy data pre-baked as fallback JSON responses for Vercel Edge.
"""

import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse

app = FastAPI(
    title="AtlasAI - Enterprise 3D Digital Twin Copilot API",
    version="2.0.0",
    description="Multi-Doc AI Engineering Copilot REST API Platform"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    """Root redirect - static files served by Vercel CDN from public/"""
    return RedirectResponse(url="/index.html", status_code=302)

@app.get("/api")
def api_root():
    return JSONResponse(content={"service": "AtlasAI Commercial AI Engineering Copilot v2.0", "status": "ok", "routes": ["/api/mapping", "/api/search", "/api/explain/{step_id}", "/api/lifecycle/{mesh_id}", "/api/copilot/chat", "/api/parts-xref", "/api/benchmark", "/api/car/parts", "/api/car/search", "/api/car/match"]})

@app.get("/api/car/parts")
def car_parts():
    """Return all indexed car parts for the Automotive Digital Twin."""
    return JSONResponse(content={"model": "BMW M4 Competition G82 2024", "vin": "WBS8M9C57H5G78412", "total_parts": 85, "status": "indexed", "categories": ["powertrain","chassis","suspension","body","interior","electrical"]})

@app.get("/api/car/search")
def car_search(q: str = ""):
    """Semantic search over the car parts knowledge base."""
    if not q:
        return JSONResponse(content={"results": [], "query": q})
    results = [
        {"id": "engine_block", "name": "Engine Block B58 (Inline-6)", "score": 0.96, "assembly": "Powertrain"},
        {"id": "turbocharger", "name": "Twin-Scroll Turbocharger", "score": 0.88, "assembly": "Powertrain"},
    ]
    return JSONResponse(content={"results": results, "query": q, "total": len(results)})

@app.get("/api/car/match/{mesh_id}")
def car_match(mesh_id: str):
    """Return full part data for a given mesh ID."""
    return JSONResponse(content={"mesh_id": mesh_id, "matched": True, "confidence": 0.95, "status": "ok"})


# ─────────────────────────────────────────
# PRE-BAKED ENGINEERING KNOWLEDGE BASE
# ─────────────────────────────────────────

MAPPING = [
    {
        "step": 1, "instruction": "Slide out the electronics drawer",
        "mesh": "Mesh_032", "confidence": 0.964,
        "reason": [
            "✓ Spatial Location: Centroid at (0.00, 0.00, 0.25) — lower assembly zone",
            "✓ Geometry Match: Flat rectangular drawer tray profile (aspect ratio 3.2:1)",
            "✓ Vector Similarity: 0.92 cosine match to 'slide out' action signature",
            "✓ Gemini LLM Verification: Confirmed electronics drawer assembly"
        ],
        "top_candidates": [
            {"mesh_id": "Mesh_032", "semantic_score": 0.92, "geometry_score": 0.88, "spatial_score": 0.91, "graph_score": 0.85, "llm_score": 0.96, "final_confidence": 0.964},
            {"mesh_id": "Mesh_241", "semantic_score": 0.74, "geometry_score": 0.71, "spatial_score": 0.80, "graph_score": 0.68, "llm_score": 0.55, "final_confidence": 0.712},
            {"mesh_id": "Mesh_001", "semantic_score": 0.61, "geometry_score": 0.58, "spatial_score": 0.70, "graph_score": 0.60, "llm_score": 0.44, "final_confidence": 0.598}
        ]
    },
    {
        "step": 2, "instruction": "Remove the bottom circuit board",
        "mesh": "Mesh_231", "confidence": 0.942,
        "reason": [
            "✓ Spatial Location: Centroid at (0.00, 0.10, 0.00) — bottom electronics frame",
            "✓ Geometry Match: Flat PCB plate geometry (large_flat_plate, high aspect ratio)",
            "✓ Assembly Context: Located inside Electronics Drawer sub-assembly",
            "✓ Gemini LLM Verification: Confirmed main PCB circuit board"
        ],
        "top_candidates": [
            {"mesh_id": "Mesh_231", "semantic_score": 0.94, "geometry_score": 0.91, "spatial_score": 0.90, "graph_score": 0.89, "llm_score": 0.96, "final_confidence": 0.942},
            {"mesh_id": "Mesh_143", "semantic_score": 0.78, "geometry_score": 0.81, "spatial_score": 0.82, "graph_score": 0.75, "llm_score": 0.62, "final_confidence": 0.769},
            {"mesh_id": "Mesh_241", "semantic_score": 0.65, "geometry_score": 0.59, "spatial_score": 0.68, "graph_score": 0.61, "llm_score": 0.48, "final_confidence": 0.622}
        ]
    },
    {
        "step": 3, "instruction": "Detach the sub circuit board",
        "mesh": "Mesh_143", "confidence": 0.921,
        "reason": [
            "✓ Spatial Location: Adjacent to main PCB (0.00, 0.12, 0.00)",
            "✓ Geometry Match: Smaller flat PCB sub-board profile",
            "✓ Knowledge Graph: Sibling node of Mesh_231 in Bottom Assembly",
            "✓ Gemini LLM Verification: Confirmed secondary sub circuit board"
        ],
        "top_candidates": [
            {"mesh_id": "Mesh_143", "semantic_score": 0.91, "geometry_score": 0.88, "spatial_score": 0.89, "graph_score": 0.86, "llm_score": 0.95, "final_confidence": 0.921},
            {"mesh_id": "Mesh_231", "semantic_score": 0.72, "geometry_score": 0.75, "spatial_score": 0.70, "graph_score": 0.68, "llm_score": 0.55, "final_confidence": 0.703}
        ]
    },
    {
        "step": 4, "instruction": "Loosen the mounting nuts",
        "mesh": "Mesh_112", "confidence": 0.908,
        "reason": [
            "✓ Geometry Match: Hexagonal cross-section fastener (nut geometry)",
            "✓ Spatial Location: Perimeter of bottom assembly frame",
            "✓ Vector Similarity: 0.90 match to 'loosen nut fastener' semantic vector",
            "✓ Gemini LLM Verification: M6 stainless steel mounting nut"
        ],
        "top_candidates": [
            {"mesh_id": "Mesh_112", "semantic_score": 0.90, "geometry_score": 0.93, "spatial_score": 0.85, "graph_score": 0.87, "llm_score": 0.95, "final_confidence": 0.908},
            {"mesh_id": "Mesh_089", "semantic_score": 0.61, "geometry_score": 0.55, "spatial_score": 0.70, "graph_score": 0.58, "llm_score": 0.42, "final_confidence": 0.602}
        ]
    },
    {
        "step": 5, "instruction": "Remove the sample clips",
        "mesh": "Mesh_004", "confidence": 0.883,
        "reason": [
            "✓ Geometry Match: Thin flat spring clip profile",
            "✓ Spatial Location: Stage platform area — middle assembly zone",
            "✓ Vector Similarity: 0.87 cosine match to 'sample clip holder'",
            "✓ Gemini LLM Verification: Stage retention clip confirmed"
        ],
        "top_candidates": [
            {"mesh_id": "Mesh_004", "semantic_score": 0.87, "geometry_score": 0.89, "spatial_score": 0.85, "graph_score": 0.82, "llm_score": 0.91, "final_confidence": 0.883},
            {"mesh_id": "Mesh_088", "semantic_score": 0.82, "geometry_score": 0.84, "spatial_score": 0.83, "graph_score": 0.79, "llm_score": 0.88, "final_confidence": 0.851}
        ]
    },
    {
        "step": 6, "instruction": "Disconnect the motor housing bracket",
        "mesh": "Mesh_098", "confidence": 0.871,
        "reason": [
            "✓ Geometry Match: Rectangular housing bracket profile",
            "✓ Spatial Location: Right-rear zone, motor drive sub-assembly",
            "✓ Knowledge Graph: Linked to stepper motor node",
            "✓ Gemini LLM Verification: Motor housing bracket confirmed (4.0 Nm torque spec)"
        ],
        "top_candidates": [
            {"mesh_id": "Mesh_098", "semantic_score": 0.85, "geometry_score": 0.82, "spatial_score": 0.88, "graph_score": 0.86, "llm_score": 0.90, "final_confidence": 0.871},
            {"mesh_id": "Mesh_241", "semantic_score": 0.62, "geometry_score": 0.58, "spatial_score": 0.65, "graph_score": 0.60, "llm_score": 0.44, "final_confidence": 0.601}
        ]
    }
]

RENAMED = [
    {"original_mesh_id": "Mesh_032", "semantic_name": "Electronics_Drawer"},
    {"original_mesh_id": "Mesh_231", "semantic_name": "Main_Circuit_Board"},
    {"original_mesh_id": "Mesh_143", "semantic_name": "Sub_Circuit_Board"},
    {"original_mesh_id": "Mesh_112", "semantic_name": "Mounting_Nut_M6"},
    {"original_mesh_id": "Mesh_004", "semantic_name": "Sample_Clip_Left"},
    {"original_mesh_id": "Mesh_088", "semantic_name": "Sample_Clip_Right"},
    {"original_mesh_id": "Mesh_098", "semantic_name": "Motor_Housing_Bracket"},
    {"original_mesh_id": "Mesh_089", "semantic_name": "Objective_Lens_40X"},
    {"original_mesh_id": "Mesh_241", "semantic_name": "Control_Module_Housing"}
]

PARTS_XREF = [
    {"component_name": "Electronics Drawer", "part_number": "EL-DRW-900", "mesh_id": "Mesh_032", "assembly_name": "Bottom Assembly", "manual_page": 2, "manual_section": "Section 1.1", "work_order_id": "WO-7741"},
    {"component_name": "Main Circuit Board", "part_number": "PCB-MAIN-880", "mesh_id": "Mesh_231", "assembly_name": "Bottom Assembly", "manual_page": 4, "manual_section": "Section 1.2", "work_order_id": "WO-8820"},
    {"component_name": "Sub Circuit Board", "part_number": "PCB-SUB-143", "mesh_id": "Mesh_143", "assembly_name": "Bottom Assembly", "manual_page": 4, "manual_section": "Section 1.2", "work_order_id": None},
    {"component_name": "Sample Clip Left", "part_number": "CLP-SMP-104", "mesh_id": "Mesh_004", "assembly_name": "Stage Assembly", "manual_page": 7, "manual_section": "Section 2.1", "work_order_id": "WO-9012"},
    {"component_name": "Sample Clip Right", "part_number": "CLP-SMP-105", "mesh_id": "Mesh_088", "assembly_name": "Stage Assembly", "manual_page": 7, "manual_section": "Section 2.1", "work_order_id": None},
    {"component_name": "Mounting Nut M6", "part_number": "NUT-M6-SS", "mesh_id": "Mesh_112", "assembly_name": "Bottom Frame", "manual_page": 9, "manual_section": "Section 2.2", "work_order_id": None},
    {"component_name": "Objective Lens 40X", "part_number": "LNS-OBJ-40X", "mesh_id": "Mesh_089", "assembly_name": "Optical Arm", "manual_page": 12, "manual_section": "Section 3.1", "work_order_id": None},
    {"component_name": "Motor Bracket", "part_number": "BRK-MTR-770", "mesh_id": "Mesh_098", "assembly_name": "Motor Drive", "manual_page": 15, "manual_section": "Section 4.1", "work_order_id": None}
]

LIFECYCLES = {
    "Mesh_032": {
        "mesh_id": "Mesh_032", "component_name": "Electronics Drawer", "part_number": "EL-DRW-900",
        "current_status": "Operational",
        "events": [
            {"timestamp": "2025-01-10", "event_type": "Manufactured", "description": "Precision CNC machined and QC signed off.", "technician": "QC Team A", "status": "Completed"},
            {"timestamp": "2025-02-15", "event_type": "Installed", "description": "Factory assembly into microscope frame.", "technician": "Lead Assembly Tech", "status": "Completed"},
            {"timestamp": "2026-03-15", "event_type": "Serviced", "description": "Guide rail lubrication & binding adjustment under WO-7741.", "work_order_id": "WO-7741", "technician": "Sarah Jenkins", "status": "Completed"}
        ]
    },
    "Mesh_231": {
        "mesh_id": "Mesh_231", "component_name": "Main Circuit Board", "part_number": "PCB-MAIN-880",
        "current_status": "Needs Maintenance",
        "events": [
            {"timestamp": "2025-01-10", "event_type": "Manufactured", "description": "SMT PCB assembly and functional test.", "technician": "PCB Fab Team", "status": "Completed"},
            {"timestamp": "2025-02-15", "event_type": "Installed", "description": "Installed in Electronics Drawer bay.", "technician": "Lead Assembly Tech", "status": "Completed"},
            {"timestamp": "2026-07-15", "event_type": "Inspection", "description": "Thermal discoloration on MOSFET Q3 found during INSP-2026-01.", "technician": "Alex Rivera", "status": "Warning"},
            {"timestamp": "2026-07-20", "event_type": "Repair Scheduled", "description": "Open WO-8820: FPGA power rail voltage fluctuation.", "work_order_id": "WO-8820", "technician": "Alex Rivera", "status": "In Progress"}
        ]
    },
    "Mesh_143": {
        "mesh_id": "Mesh_143", "component_name": "Sub Circuit Board", "part_number": "PCB-SUB-143",
        "current_status": "Operational",
        "events": [
            {"timestamp": "2025-01-10", "event_type": "Manufactured", "description": "SMT sub-board assembly.", "technician": "PCB Fab Team", "status": "Completed"},
            {"timestamp": "2025-02-15", "event_type": "Installed", "description": "Mounted on Main PCB.", "technician": "Lead Assembly Tech", "status": "Completed"}
        ]
    },
    "Mesh_004": {
        "mesh_id": "Mesh_004", "component_name": "Sample Clip Left", "part_number": "CLP-SMP-104",
        "current_status": "Operational",
        "events": [
            {"timestamp": "2025-02-15", "event_type": "Installed", "description": "Stage retention clip installed.", "technician": "Assembly Tech", "status": "Completed"},
            {"timestamp": "2026-05-10", "event_type": "Replacement", "description": "Replaced fatigued spring clip under WO-9012.", "work_order_id": "WO-9012", "technician": "Michael Chen", "status": "Completed"}
        ]
    },
    "Mesh_088": {
        "mesh_id": "Mesh_088", "component_name": "Sample Clip Right", "part_number": "CLP-SMP-105",
        "current_status": "Operational",
        "events": [
            {"timestamp": "2025-02-15", "event_type": "Installed", "description": "Stage retention clip installed.", "technician": "Assembly Tech", "status": "Completed"},
            {"timestamp": "2026-06-01", "event_type": "Inspection", "description": "100% operational. No wear detected.", "technician": "Field Tech", "status": "Completed"}
        ]
    },
    "Mesh_098": {
        "mesh_id": "Mesh_098", "component_name": "Motor Bracket", "part_number": "BRK-MTR-770",
        "current_status": "Operational",
        "events": [
            {"timestamp": "2025-02-15", "event_type": "Installed", "description": "Motor housing bracket installed at 4.0 Nm.", "technician": "Assembly Tech", "status": "Completed"},
            {"timestamp": "2026-06-01", "event_type": "Inspection", "description": "Routine check passed.", "technician": "Field Tech", "status": "Completed"}
        ]
    },
    "Mesh_112": {
        "mesh_id": "Mesh_112", "component_name": "Mounting Nut M6", "part_number": "NUT-M6-SS",
        "current_status": "Operational",
        "events": [
            {"timestamp": "2025-02-15", "event_type": "Installed", "description": "Installed at 6.0 Nm torque.", "technician": "Assembly Tech", "status": "Completed"}
        ]
    },
    "Mesh_089": {
        "mesh_id": "Mesh_089", "component_name": "Objective Lens 40X", "part_number": "LNS-OBJ-40X",
        "current_status": "Operational",
        "events": [
            {"timestamp": "2025-02-15", "event_type": "Installed", "description": "Precision objective lens installed hand-tight.", "technician": "Optical Tech", "status": "Completed"}
        ]
    }
}

BENCHMARK = {
    "system": "AtlasAI Commercial AI Engineering Copilot v2.0",
    "performance_metrics": {
        "glb_loading_time_ms": 142.5,
        "mesh_intelligence_time_ms": 32.1,
        "embedding_indexing_time_ms": 48.2,
        "candidate_search_time_ms": 48.2,
        "llm_reasoning_time_ms": 75.6,
        "ranking_time_ms": 12.0,
        "total_execution_time_ms": 266.37
    }
}

EXPLAIN_TIMELINES = [
    {"stage_name": "Stage 1: Action & Entity Extraction", "description": "Identified action & target component from NL instruction", "candidate_count": 241},
    {"stage_name": "Stage 2: Deterministic Spatial Filter", "description": "Boundary + zone filter reduced field: 241 → 20", "candidate_count": 20},
    {"stage_name": "Stage 3-4: Spatial & Geometry Scoring", "description": "Position centroid & bounding box evaluation: 20 → 10", "candidate_count": 10},
    {"stage_name": "Stage 5-6: Semantic Vector & Graph Scoring", "description": "TF-IDF + knowledge graph traversal: 10 → 5", "candidate_count": 5},
    {"stage_name": "Stage 7: Gemini LLM Verification", "description": "LLM evaluated final 5 candidates with full context", "candidate_count": 5},
    {"stage_name": "Stage 8-12: Score Fusion & Self-Validation", "description": "Weighted multi-modal fusion → Final winner selected", "candidate_count": 1}
]

# ─────────────────────────────────────────
# API ROUTES
# ─────────────────────────────────────────

@app.get("/api/mapping")
def get_mapping():
    return JSONResponse(content=MAPPING)

@app.get("/api/renamed")
def get_renamed():
    return JSONResponse(content=RENAMED)

@app.get("/api/parts-xref")
def get_parts_xref():
    return JSONResponse(content=PARTS_XREF)

@app.get("/api/benchmark")
def get_benchmark():
    return JSONResponse(content=BENCHMARK)

@app.get("/api/explain/{step_id}")
def get_explain(step_id: int):
    step_item = next((s for s in MAPPING if s["step"] == step_id), MAPPING[0])
    renamed = next((r["semantic_name"] for r in RENAMED if r["original_mesh_id"] == step_item["mesh"]), step_item["mesh"])
    return JSONResponse(content={
        "step": step_id,
        "instruction": step_item["instruction"],
        "matched_mesh": step_item["mesh"],
        "semantic_name": renamed,
        "confidence": step_item["confidence"],
        "reasoning_timeline": EXPLAIN_TIMELINES,
        "evidence_chain": [{"category": "Evidence", "statement": r, "verified": True} for r in step_item["reason"]],
        "top_candidates": step_item["top_candidates"],
        "rejected_candidates": step_item["top_candidates"][1:]
    })

@app.get("/api/lifecycle/{mesh_id}")
def get_lifecycle(mesh_id: str):
    lc = LIFECYCLES.get(mesh_id)
    if not lc:
        # Fallback for any unregistered mesh
        xref = next((x for x in PARTS_XREF if x["mesh_id"] == mesh_id), None)
        lc = {
            "mesh_id": mesh_id,
            "component_name": xref["component_name"] if xref else mesh_id,
            "part_number": xref["part_number"] if xref else "PART-000",
            "current_status": "Operational",
            "events": [
                {"timestamp": "2025-02-15", "event_type": "Installed", "description": "Component installed during factory assembly.", "technician": "Assembly Tech", "status": "Completed"},
                {"timestamp": "2026-06-01", "event_type": "Inspection", "description": "Routine maintenance check completed. 100% operational.", "technician": "Field Tech", "status": "Completed"}
            ]
        }
    return JSONResponse(content=lc)

@app.get("/api/search")
def global_search(q: str = ""):
    if not q:
        return JSONResponse(content=[])

    q_lower = q.lower().strip()
    results = []

    # Search Parts Cross Reference
    for xref in PARTS_XREF:
        if (q_lower in xref["component_name"].lower() or
            q_lower in xref["part_number"].lower() or
            q_lower in xref["mesh_id"].lower() or
            q_lower in (xref["work_order_id"] or "").lower() or
            q_lower in xref["manual_section"].lower()):
            results.append({
                "result_id": f"part_{xref['part_number']}",
                "title": f"{xref['component_name']} ({xref['part_number']})",
                "category": "Part & CAD Mesh",
                "description": f"Mesh {xref['mesh_id']} in {xref['assembly_name']}. Manual {xref['manual_section']} (Page {xref['manual_page']}).",
                "mesh_id": xref["mesh_id"],
                "relevance_score": 0.98
            })

    # Search Renamed Mesh Index
    for r in RENAMED:
        friendly = r["semantic_name"].replace("_", " ").lower()
        if q_lower in friendly and not any(res["mesh_id"] == r["original_mesh_id"] for res in results):
            results.append({
                "result_id": f"mesh_{r['original_mesh_id']}",
                "title": f"{r['semantic_name'].replace('_', ' ')} ({r['original_mesh_id']})",
                "category": "CAD Mesh",
                "description": f"Semantic component match in 3D Digital Twin model.",
                "mesh_id": r["original_mesh_id"],
                "relevance_score": 0.90
            })

    # Search Service Steps
    for step in MAPPING:
        if q_lower in step["instruction"].lower() and not any(res["mesh_id"] == step["mesh"] for res in results):
            results.append({
                "result_id": f"step_{step['step']}",
                "title": f"Step {step['step']}: {step['instruction'][:50]}",
                "category": "Service Instruction",
                "description": f"Maps to {step['mesh']} with {step['confidence']*100:.0f}% confidence.",
                "mesh_id": step["mesh"],
                "relevance_score": 0.85
            })

    results.sort(key=lambda x: x["relevance_score"], reverse=True)
    return JSONResponse(content=results[:8])

@app.get("/api/copilot/chat")
def copilot_chat(q: str = ""):
    if not q:
        raise HTTPException(status_code=400, detail="Query parameter 'q' is required.")

    q_lower = q.lower()
    highlight_meshes = []
    warnings = []
    part_numbers = []
    answer = ""

    if "drawer" in q_lower or "wo-7741" in q_lower:
        highlight_meshes = ["Mesh_032", "Mesh_241"]
        part_numbers = ["EL-DRW-900"]
        answer = "Electronics Drawer EL-DRW-900 (Mesh_032) was serviced under Work Order WO-7741 for guide rail binding."
    elif "circuit board" in q_lower or "pcb" in q_lower or "main board" in q_lower:
        highlight_meshes = ["Mesh_231", "Mesh_143"]
        part_numbers = ["PCB-MAIN-880", "PCB-SUB-143"]
        warnings = ["Wear anti-static ESD wrist strap during handling."]
        answer = "Located Main PCB PCB-MAIN-880 (Mesh_231) and Sub Board PCB-SUB-143 (Mesh_143) in Bottom Assembly. WO-8820 is currently open for FPGA power rail issue."
    elif "clip" in q_lower or "sample" in q_lower:
        highlight_meshes = ["Mesh_004", "Mesh_088"]
        part_numbers = ["CLP-SMP-104", "CLP-SMP-105"]
        answer = "Dual stage retention clips: Left CLP-SMP-104 (Mesh_004) and Right CLP-SMP-105 (Mesh_088) per Section 2.1."
    elif "nut" in q_lower or "bolt" in q_lower or "fastener" in q_lower or "mounting" in q_lower:
        highlight_meshes = ["Mesh_112"]
        part_numbers = ["NUT-M6-SS"]
        warnings = ["Do not exceed 6.0 Nm torque rating."]
        answer = "Mounting Nut M6 NUT-M6-SS (Mesh_112) in Bottom Frame. Torque spec: 6.0 Nm (Section 2.2)."
    elif "lens" in q_lower or "objective" in q_lower or "optic" in q_lower:
        highlight_meshes = ["Mesh_089"]
        part_numbers = ["LNS-OBJ-40X"]
        warnings = ["Do not touch optical glass surfaces. Use lens paper only."]
        answer = "Objective Lens 40X LNS-OBJ-40X (Mesh_089) on optical nosepiece (Section 3.1). Handle with cotton gloves."
    elif "motor" in q_lower or "bracket" in q_lower:
        highlight_meshes = ["Mesh_098"]
        part_numbers = ["BRK-MTR-770"]
        answer = "Motor Housing Bracket BRK-MTR-770 (Mesh_098) in Motor Drive sub-assembly. Torque: 4.0 Nm (Section 4.1)."
    else:
        answer = f"AtlasAI scanned 250 CAD nodes and 4 engineering documents. Try: 'circuit board', 'drawer', 'motor', 'lens', 'clip', 'fastener', or a work order like 'WO-7741'."
        highlight_meshes = ["Mesh_032"]

    return JSONResponse(content={
        "query": q,
        "answer": answer,
        "highlight_meshes": highlight_meshes,
        "part_numbers": part_numbers,
        "warnings": warnings,
        "confidence": 0.95,
        "referenced_documents": []
    })

@app.get("/api/mesh-report")
def get_mesh_report():
    return JSONResponse(content={"total_meshes": 241, "system": "AtlasAI CAD Analysis Engine"})

@app.get("/api/mesh-graph")
def get_mesh_graph():
    return JSONResponse(content={"total_nodes": 241, "total_edges": 6130, "nodes": [], "edges": []})

@app.get("/api/engineering-graph")
def get_engineering_graph():
    return JSONResponse(content={"total_nodes": 58, "total_edges": 142, "nodes": [], "edges": []})

@app.get("/api/pipeline/run")
def trigger_pipeline():
    return JSONResponse(content={"status": "success", "message": "AtlasAI pipeline completed.", "total_steps_mapped": 6})

@app.get("/api/health")
def health():
    return JSONResponse(content={"status": "ok", "service": "AtlasAI Commercial AI Engineering Copilot v2.0"})

# Export handler for Vercel
handler = app
