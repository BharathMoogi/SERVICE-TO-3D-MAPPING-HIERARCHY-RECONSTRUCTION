"""
Module 9: Output Generator & Enterprise Exporters
Generates mapping.json, mesh_report.json, mesh_graph.json, benchmark.json, renamed_mapping.json, and report.html.
"""

import json
import logging
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any

from atlasai.domain.models import MappingResult, MeshMetadata, VisualDebuggerReport
from atlasai.domain.repository import MeshRepository
from atlasai.engines.knowledge_graph import MeshKnowledgeGraphEngine
from atlasai.engines.auto_rename import MeshAutoRenameEngine
from atlasai.engines.visual_report import VisualReportGenerator
from atlasai.utils.benchmark import BenchmarkTracker

logger = logging.getLogger("AtlasAI.OutputGenerator")

class OutputGenerator:
    """Exports structured JSON artifacts and interactive HTML reports."""

    def __init__(self):
        self.kg_engine = MeshKnowledgeGraphEngine()
        self.rename_engine = MeshAutoRenameEngine()
        self.html_report_generator = VisualReportGenerator()

    def export_all_artifacts(
        self,
        mapping_results: List[MappingResult],
        repository: MeshRepository,
        benchmark: BenchmarkTracker,
        output_dir: str | Path
    ) -> Dict[str, Path]:
        """Generates and writes all 6 enterprise deliverables."""
        out_path = Path(output_dir)
        out_path.mkdir(parents=True, exist_ok=True)

        generated_files = {}

        # 1. mapping.json
        mapping_file = self.export_mapping_json(mapping_results, out_path / "mapping.json")
        generated_files["mapping.json"] = mapping_file

        # 2. mesh_report.json (Visual Debugger)
        mesh_report_file = self.export_visual_debugger_json(repository, out_path / "mesh_report.json")
        generated_files["mesh_report.json"] = mesh_report_file

        # 3. mesh_graph.json (NetworkX Knowledge Graph)
        graph = self.kg_engine.build_graph(repository)
        mesh_graph_file = self.kg_engine.export_mesh_graph_json(graph, out_path / "mesh_graph.json")
        generated_files["mesh_graph.json"] = mesh_graph_file

        # 4. renamed_mapping.json
        renamed_catalog = self.rename_engine.generate_renamed_mappings(mapping_results, repository)
        renamed_file = self.rename_engine.export_renamed_mapping_json(renamed_catalog, out_path / "renamed_mapping.json")
        generated_files["renamed_mapping.json"] = renamed_file

        # 5. benchmark.json
        benchmark_file = benchmark.export_benchmark_json(out_path / "benchmark.json")
        generated_files["benchmark.json"] = benchmark_file

        # 6. report.html (Standalone HTML visual report)
        benchmark_data = {
            "system": "AtlasAI Intelligent Service-to-3D Mapping Engine",
            "performance_metrics": benchmark.metrics,
            "timestamp_ms": int(datetime.utcnow().timestamp() * 1000)
        }
        report_html_file = self.html_report_generator.generate_html_report(
            mapping_results, repository, benchmark_data, out_path / "report.html"
        )
        generated_files["report.html"] = report_html_file

        # 7. Legacy report.md for markdown inspection
        report_md_file = self.export_explainable_markdown_report(mapping_results, repository, out_path / "report.md")
        generated_files["report.md"] = report_md_file

        return generated_files

    def export_mapping_json(self, mapping_results: List[MappingResult], output_path: str | Path) -> Path:
        path = Path(output_path)
        path.parent.mkdir(parents=True, exist_ok=True)

        export_data = []
        for res in mapping_results:
            export_data.append({
                "step": res.step,
                "instruction": res.instruction,
                "mesh": res.mesh,
                "confidence": res.confidence,
                "reason": res.reason,
                "top_candidates": [c.model_dump() for c in res.top_candidates[:5]]
            })

        with open(path, "w", encoding="utf-8") as f:
            json.dump(export_data, f, indent=2)

        logger.info(f"Generated mapping.json at: {path}")
        return path

    def export_visual_debugger_json(self, repository: MeshRepository, output_path: str | Path) -> Path:
        path = Path(output_path)
        path.parent.mkdir(parents=True, exist_ok=True)

        report = VisualDebuggerReport(
            total_meshes=len(repository),
            mesh_catalog=repository.list_all(),
            execution_timestamp=datetime.utcnow().isoformat() + "Z"
        )

        with open(path, "w", encoding="utf-8") as f:
            json.dump(report.model_dump(), f, indent=2)

        logger.info(f"Generated mesh_report.json (Visual Debugger) at: {path}")
        return path

    def export_explainable_markdown_report(
        self,
        mapping_results: List[MappingResult],
        repository: MeshRepository,
        output_path: str | Path
    ) -> Path:
        path = Path(output_path)
        path.parent.mkdir(parents=True, exist_ok=True)

        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        md_lines = [
            "# AtlasAI - Intelligent Service-to-3D Mapping Engine Report",
            f"*Generated on {timestamp} | Metadome.ai Service-to-3D Hackathon*",
            "",
            "## Executive Summary",
            f"AtlasAI successfully loaded and analyzed **{len(repository)} generic 3D mesh nodes** from the digital twin model ",
            f"and mapped **{len(mapping_results)} engineering maintenance instructions** to exact sub-assemblies using multi-modal AI reasoning.",
            "",
            "| Step # | Instruction | Matched 3D Mesh | Confidence | Primary Rationale |",
            "| --- | --- | --- | --- | --- |"
        ]

        for res in mapping_results:
            first_reason = res.reason[0] if res.reason else "Multi-modal vector match"
            md_lines.append(
                f"| `{res.step}` | {res.instruction} | **{res.mesh}** | `{res.confidence * 100:.1f}%` | {first_reason} |"
            )

        md_lines.extend([
            "",
            "---",
            "",
            "## Detailed Step-by-Step Decision Rationale",
            ""
        ])

        for res in mapping_results:
            md_lines.extend([
                f"### Step {res.step}: \"{res.instruction}\"",
                f"- **Final Selection**: `{res.mesh}`",
                f"- **Overall Confidence Score**: `{res.confidence:.4f}`",
                "",
                "#### Reasoning Evidence Chain:",
            ])

            for r in res.reason:
                md_lines.append(f"  - {r}")

            md_lines.extend([
                "",
                "#### Top Candidate Rankings & Rejection Rationale:",
                "| Candidate Mesh | Vector Score | Geometry Score | Spatial Score | LLM Score | Final Confidence | Status | Rationale |",
                "| --- | --- | --- | --- | --- | --- | --- | --- |"
            ])

            for cand in res.top_candidates[:5]:
                is_winner = cand.mesh_id == res.mesh
                status = "✅ **SELECTED**" if is_winner else "❌ Rejected"
                rationale = "Top score alignment" if is_winner else (cand.reasoning_points[0] if cand.reasoning_points else "Lower similarity score")
                md_lines.append(
                    f"| `{cand.mesh_id}` | `{cand.semantic_score:.2f}` | `{cand.geometry_score:.2f}` | "
                    f"`{cand.spatial_score:.2f}` | `{cand.llm_score:.2f}` | `{cand.final_confidence:.4f}` | {status} | {rationale} |"
                )

            md_lines.append("")

        content = "\n".join(md_lines)
        with open(path, "w", encoding="utf-8") as f:
            f.write(content)

        return path
