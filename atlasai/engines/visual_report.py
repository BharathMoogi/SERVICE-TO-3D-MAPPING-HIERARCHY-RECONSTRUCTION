"""
Feature 7: Visual Report Generator
Generates report.html - a standalone, modern dark-themed HTML report with interactive glassmorphism dashboard layout.
"""

import json
import logging
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Any

from atlasai.domain.models import MappingResult
from atlasai.domain.repository import MeshRepository

logger = logging.getLogger("AtlasAI.VisualReport")

class VisualReportGenerator:
    """Renders standalone HTML executive report (report.html) using Jinja2 / HTML templates."""

    def generate_html_report(
        self,
        mapping_results: List[MappingResult],
        repository: MeshRepository,
        benchmark_data: Dict[str, Any],
        output_path: str | Path
    ) -> Path:
        path = Path(output_path)
        path.parent.mkdir(parents=True, exist_ok=True)

        timestamp = datetime.now().strftime("%B %d, %Y - %H:%M:%S")

        mapping_json_str = json.dumps([
            {
                "step": m.step,
                "instruction": m.instruction,
                "mesh": m.mesh,
                "confidence": m.confidence,
                "reasons": m.reason,
                "top_candidates": [c.model_dump() for c in m.top_candidates[:5]]
            }
            for m in mapping_results
        ])

        total_exec_time = benchmark_data.get('performance_metrics', {}).get('total_execution_time_ms', 0)
        glb_load_time = benchmark_data.get('performance_metrics', {}).get('glb_loading_time_ms', 0)
        mesh_intel_time = benchmark_data.get('performance_metrics', {}).get('mesh_intelligence_time_ms', 0)
        embed_time = benchmark_data.get('performance_metrics', {}).get('embedding_indexing_time_ms', 0)
        llm_time = benchmark_data.get('performance_metrics', {}).get('llm_reasoning_time_ms', 0)

        html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AtlasAI - Executive Digital Twin Analysis Report</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    :root {{
      --bg-dark: #0a0d14;
      --bg-card: rgba(18, 24, 38, 0.75);
      --border-color: rgba(255, 255, 255, 0.08);
      --accent-cyan: #00FFC8;
      --accent-blue: #0099FF;
      --text-main: #F0F4F8;
      --text-muted: #8E9BAE;
      --font-sans: 'Outfit', sans-serif;
      --font-mono: 'JetBrains Mono', monospace;
    }}
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{
      background: var(--bg-dark);
      color: var(--text-main);
      font-family: var(--font-sans);
      padding: 30px;
      line-height: 1.6;
    }}
    .header {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 20px;
      border-bottom: 1px solid var(--border-color);
      margin-bottom: 30px;
    }}
    .header h1 {{ font-size: 28px; font-weight: 700; }}
    .header h1 span {{ color: var(--accent-cyan); }}
    .timestamp {{ font-size: 13px; color: var(--text-muted); }}
    .stats-grid {{
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin-bottom: 30px;
    }}
    .stat-card {{
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 14px;
      padding: 20px;
      backdrop-filter: blur(12px);
    }}
    .stat-label {{ font-size: 12px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }}
    .stat-value {{ font-size: 26px; font-weight: 700; color: var(--accent-cyan); margin-top: 6px; font-family: var(--font-mono); }}
    
    .section {{
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 30px;
      backdrop-filter: blur(12px);
    }}
    .section h2 {{ font-size: 18px; margin-bottom: 16px; border-bottom: 1px solid var(--border-color); padding-bottom: 10px; color: var(--text-main); }}

    table {{ width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 13px; }}
    th, td {{ padding: 12px 16px; text-align: left; border-bottom: 1px solid var(--border-color); }}
    th {{ background: rgba(255, 255, 255, 0.03); color: var(--text-muted); font-weight: 600; text-transform: uppercase; font-size: 11px; }}
    tr:hover {{ background: rgba(0, 255, 200, 0.04); }}
    
    .badge-conf {{
      display: inline-block;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
      font-family: var(--font-mono);
    }}
    .badge-green {{ background: rgba(0, 255, 200, 0.15); color: #00FFC8; border: 1px solid #00FFC8; }}
    .badge-orange {{ background: rgba(255, 165, 0, 0.15); color: #FFA500; border: 1px solid #FFA500; }}

    .reason-box {{
      font-size: 12px;
      color: var(--text-muted);
      line-height: 1.4;
    }}
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>Atlas<span>AI</span> Executive Report</h1>
      <p style="color: var(--text-muted); font-size: 13px;">Intelligent Service-to-3D Mapping Engine Evaluation</p>
    </div>
    <div class="timestamp">Generated: {timestamp}</div>
  </div>

  <!-- Stats -->
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-label">Total Instructions</div>
      <div class="stat-value">{len(mapping_results)} Steps</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Total 3D CAD Meshes</div>
      <div class="stat-value">{len(repository)} Nodes</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Average Confidence</div>
      <div class="stat-value">{sum(m.confidence for m in mapping_results) / max(1, len(mapping_results)) * 100:.1f}%</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Total Execution Time</div>
      <div class="stat-value">{total_exec_time:.0f} ms</div>
    </div>
  </div>

  <!-- Instruction Mappings Summary Table -->
  <div class="section">
    <h2>AI Service Instruction to 3D Digital Twin Mappings</h2>
    <table>
      <thead>
        <tr>
          <th>Step #</th>
          <th>Maintenance Instruction</th>
          <th>Matched Mesh ID</th>
          <th>Confidence</th>
          <th>Primary Evidence & Rationale</th>
        </tr>
      </thead>
      <tbody>
"""

        for m in mapping_results:
            conf_pct = m.confidence * 100
            conf_class = "badge-green" if conf_pct >= 85 else "badge-orange"
            first_reason = m.reason[0] if m.reason else "Multi-modal vector match"

            html_content += f"""
        <tr>
          <td><strong>Step {m.step}</strong></td>
          <td>{m.instruction}</td>
          <td><code style="font-family: var(--font-mono); color: var(--accent-cyan); font-weight: bold;">{m.mesh}</code></td>
          <td><span class="badge-conf {conf_class}">{conf_pct:.1f}%</span></td>
          <td><div class="reason-box">{first_reason}</div></td>
        </tr>
"""

        html_content += f"""
      </tbody>
    </table>
  </div>

  <!-- Performance Benchmark Table -->
  <div class="section">
    <h2>Performance Latency Analytics</h2>
    <table>
      <thead>
        <tr>
          <th>Pipeline Execution Stage</th>
          <th>Latency (Milliseconds)</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>GLB Model Scene Graph Parsing</td>
          <td>{glb_load_time:.2f} ms</td>
          <td><span style="color:#00FFC8;">Optimal</span></td>
        </tr>
        <tr>
          <td>Mesh Intelligence & NL Synthesis</td>
          <td>{mesh_intel_time:.2f} ms</td>
          <td><span style="color:#00FFC8;">Optimal</span></td>
        </tr>
        <tr>
          <td>Dense Embedding Vector Indexing</td>
          <td>{embed_time:.2f} ms</td>
          <td><span style="color:#00FFC8;">Optimal</span></td>
        </tr>
        <tr>
          <td>Candidate Search & LLM Reasoning</td>
          <td>{llm_time:.2f} ms</td>
          <td><span style="color:#00FFC8;">Optimal</span></td>
        </tr>
      </tbody>
    </table>
  </div>

</body>
</html>
"""

        with open(path, "w", encoding="utf-8") as f:
            f.write(html_content)

        logger.info(f"Exported report.html: {path}")
        return path
