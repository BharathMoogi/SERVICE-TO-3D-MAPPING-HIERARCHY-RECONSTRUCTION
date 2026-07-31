# AtlasAI - Intelligent Service-to-3D Mapping Engine

[![Metadome.ai Hackathon](https://img.shields.io/badge/Metadome.ai-Hackathon--Production-brightgreen.svg)](https://metadome.ai)
[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![Architecture](https://img.shields.io/badge/Architecture-SOLID%20%7C%20Multi--Modal-purple.svg)]()
[![License](https://img.shields.io/badge/License-Proprietary-gold.svg)]()

> **Tagline**: *"Understanding engineering instructions and connecting them with complex 3D digital twins."*

---

## 📌 Executive Overview

**AtlasAI** is an enterprise-grade AI engine designed for the **Metadome.ai Service-to-3D Mapping Hackathon**. 

In modern industrial maintenance and digital twin engineering, maintenance manuals contain human-written service steps (`steps.json`), while 3D CAD digital twin models (`microscope.glb`) contain hundreds of generic, unlabelled mesh nodes (e.g., `Mesh_001`, `Mesh_057`, `Mesh_128`). Standard keyword matching fails because 3D CAD exports do not contain human component names.

**AtlasAI** solves this challenge through a **9-Stage Multi-Modal AI Reasoning Pipeline**:
1. **GLB Analysis Engine**: Parses scene graph tree, global transform matrices, world coordinates, surface area, and volume.
2. **Mesh Intelligence Engine**: Infers geometric shape classifications (e.g. `large_flat_plate`, `drawer_tray`, `fastener_nut`, `cylinder_rod`) and synthesizes natural language descriptions.
3. **Instruction Intelligence Engine**: Extracts structured mechanical entities (`action`, `target_object`, `position_cue`, `attribute_hints`).
4. **Semantic Knowledge Engine**: Encodes dense vector embeddings (`sentence-transformers` / vector index).
5. **Candidate Retrieval Engine**: Top-K multi-criteria pre-ranking.
6. **AI Reasoning Engine**: Multi-modal LLM reasoning with Google Gemini API & offline heuristic fallback.
7. **Multi-Stage Ranking Engine**: MCDA score fusion ($w_{\text{sem}}, w_{\text{geom}}, w_{\text{spatial}}, w_{\text{hier}}, w_{\text{llm}}$).
8. **Explainability Engine**: Formulates transparent reasoning evidence chains.
9. **Output Generator**: Exports `mapping.json`, `mesh_report.json` (Visual Debugger), `report.md` (Explainable Report), and drives an interactive 3D Web Visualizer.

---

## 🏗️ Architecture Diagram

```
                             [ Input Layer ]
                 (steps.json & unlabelled microscope.glb)
                                    │
                                    ▼
                         [ GLB Analysis Engine ]
             (Node Hierarchy, Trimesh, Bounding Box, Volume)
                                    │
                                    ▼
                      [ Mesh Intelligence Engine ]
               (Geometric Heuristics, Spatial Tags, NL Desc)
                                    │
                                    ▼
                  [ Instruction Intelligence Engine ]
              (Action / Target / Position / Attributes JSON)
                                    │
                                    ▼
                     [ Semantic Knowledge Engine ]
               (Sentence Transformers / Vector Embedding)
                                    │
                                    ▼
                    [ Candidate Retrieval Engine ]
               (Top 10 Pre-Filtering by Spatial & Vector)
                                    │
                                    ▼
                      [ Semantic Reasoning Engine ]
                (Gemini API Provider / Local Heuristic)
                                    │
                                    ▼
                    [ Multi-Stage Ranking Engine ]
             (MCDA Score Fusion: Vector + Geom + Hier + LLM)
                                    │
                                    ▼
                      [ Explainability Engine ]
                    (Verifiable Evidence Breakdown)
                                    │
                                    ▼
                       [ Output Generator & CLI ]
          (mapping.json, mesh_report.json, report.md, Web UI)
```

---

## 📁 Repository Directory Structure

```
metadome.ai/
├── atlasai/                          # Core Engine Package
│   ├── __init__.py
│   ├── __main__.py
│   ├── cli.py                        # Click + Rich CLI Interface
│   ├── pipeline.py                   # Master Pipeline Orchestrator
│   ├── config/
│   │   ├── __init__.py
│   │   └── settings.py               # Config-driven Pydantic BaseSettings
│   ├── domain/
│   │   ├── __init__.py
│   │   ├── models.py                 # Pydantic v2 Domain Data Models
│   │   └── repository.py             # Repository Pattern Mesh Store
│   ├── engines/
│   │   ├── __init__.py
│   │   ├── glb_analyzer.py           # Module 1: GLB Analysis Engine
│   │   ├── mesh_intelligence.py      # Module 2: Mesh Intelligence Engine
│   │   ├── instruction_intelligence.py # Module 3: Instruction Intelligence
│   │   ├── semantic_knowledge.py     # Module 4: Vector Embeddings & Index
│   │   ├── candidate_retrieval.py    # Module 5: Candidate Retrieval Engine
│   │   ├── ai_reasoning.py           # Module 6: Gemini API & Heuristic AI
│   │   ├── multi_stage_ranking.py    # Module 7: Multi-Stage Score Fusion
│   │   ├── explainability.py         # Module 8: Evidence Generator
│   │   └── output_generator.py       # Module 9: Output Exporters
│   └── adapters/                     # Future-Ready Enterprise Adapters
│       ├── __init__.py
│       ├── digital_twin.py           # Live REST/gRPC Telemetry Adapter
│       ├── knowledge_graph.py        # Neo4j/RDF CAD Triplet Generator
│       ├── rag_manual.py             # Manual Document Retrieval Adapter
│       └── vlm_vision.py             # Multimodal 2D Crop Render Adapter
├── scripts/
│   ├── generate_sample_data.py       # 250-Mesh Synthetic CAD GLB Generator
│   └── run_demo.py                   # One-Click End-to-End Benchmark Run
├── web_visualizer/                   # Enterprise 3D Web Dashboard
│   ├── index.html                    # Glassmorphism UI Layout
│   ├── styles.css                    # Dark Mode CSS Tokens
│   └── app.js                        # Three.js 3D Viewport & Debugger
├── tests/                            # Automated Pytest Suite
│   ├── __init__.py
│   ├── test_glb_analyzer.py
│   ├── test_mesh_intelligence.py
│   ├── test_instruction_intelligence.py
│   └── test_pipeline.py
├── pyproject.toml
├── requirements.txt
├── README.md
└── .env.example
```

---

## ⚡ Quick Start & Execution

### 1. Installation

```bash
# Clone the repository and install dependencies
pip install -r requirements.txt
pip install -e .
```

### 2. Generate Benchmark Dataset & Run Pipeline

Run the one-click demo script which generates a realistic `microscope.glb` containing ~250 unlabelled meshes (`Mesh_001` to `Mesh_250`) and executes the mapping pipeline:

```bash
python scripts/run_demo.py
```

### 3. CLI Execution

You can also run the system using the `atlasai` CLI command:

```bash
# Generate synthetic 250-mesh CAD model and steps.json
python -m atlasai.cli generate-sample-data --out-dir sample_data

# Execute mapping engine
python -m atlasai.cli run --glb sample_data/microscope.glb --steps sample_data/steps.json --out-dir output/
```

---

## 📊 Sample Output Formats

### `mapping.json` (Required Deliverable)
```json
[
  {
    "step": 1,
    "instruction": "Slide out the electronics drawer",
    "mesh": "Mesh_032",
    "confidence": 0.964,
    "reason": [
      "Spatial Location: Situated in bottom assembly at world coordinates (0.00, 0.00, 0.25).",
      "Geometric Profile: Classified as 'drawer tray' with dimensions (1.00m x 0.80m x 0.15m) and volume 0.120000 m^3.",
      "Semantic Embedding Match: Dense vector cosine similarity score of 0.92 against instruction target 'electronics drawer'.",
      "Structural Context: Positioned adjacent to sub-assembly components (Mesh_143, Mesh_001).",
      "AI Reasoning: Drawer-like rectangular enclosure situated at lower compartment."
    ]
  },
  {
    "step": 2,
    "instruction": "Remove the bottom circuit board",
    "mesh": "Mesh_143",
    "confidence": 0.942,
    "reason": [
      "Spatial Location: Situated in bottom assembly at world coordinates (0.00, 0.00, 0.28).",
      "Geometric Profile: Classified as 'large flat plate' with dimensions (0.80m x 0.60m x 0.02m).",
      "Semantic Embedding Match: Dense vector cosine similarity score of 0.94 against instruction target 'circuit board'.",
      "Structural Context: Positioned inside electronics drawer compartment.",
      "AI Reasoning: High aspect ratio PCB plate geometry located in bottom electronics tray."
    ]
  }
]
```

### `mesh_report.json` (Bonus Feature: Visual Debugger)
Contains full 3D metadata catalog for all 250 meshes, including world transforms, aspect ratios, geometric classifications, spatial zones, and generated NL descriptions.

### `report.md` (Bonus Feature: Explainable Markdown Report)
Includes executive summaries, instruction-to-mesh decision matrices, candidate ranking tables, and rejected candidate rationale.

---

## 🌐 Enterprise 3D Web Visualizer

Open `web_visualizer/index.html` in any modern web browser to launch the live interactive hackathon demonstration dashboard featuring:
- **Three.js 3D Viewport**: Interactive camera controls, lighting, and wireframe toggle over the CAD model.
- **Instruction Step Browser**: Click any maintenance instruction to inspect AI mapping.
- **Real-Time 3D Highlighting**: Automatically highlights the matched 3D sub-assembly node in glowing neon cyan (`#00FFC8`).
- **Explainability Panel**: Displays live Gemini AI rationale, candidate comparison lists, and physical geometry metrics.

---

## 🧪 Automated Testing

Run unit and integration tests via `pytest`:

```bash
pytest tests/
```

---

## 🛠️ Software Engineering Standards
- **Python 3.11+ & Pydantic v2**: Type-safe domain models and runtime data validation.
- **SOLID Principles & Clean Architecture**: Complete separation of concerns across GLB analysis, mesh intelligence, candidate retrieval, LLM reasoning, and output exporters.
- **Repository & Factory Patterns**: Extensible `MeshRepository` and abstract `LLMProviderBase` (Gemini API / Heuristic AI).
- **Config-Driven**: Zero hardcoded secrets, managed via `.env` and `Settings`.

---

## 📜 License
Developed for the **Metadome.ai Service-to-3D Mapping Hackathon**.
