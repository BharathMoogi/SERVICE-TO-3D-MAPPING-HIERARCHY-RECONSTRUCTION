"""
Module 1: Document Intelligence Engine
Multi-format document ingestion pipeline (PDF, Markdown, CSV, TXT, JSON).
Extracts structured sections, tables, part numbers, warnings, torque values, and maintenance procedures.
"""

import json
import csv
import logging
from pathlib import Path
from typing import List, Dict, Any

from atlasai.domain.models import DocumentSection, EngineeringEntity

logger = logging.getLogger("AtlasAI.DocumentIntelligence")


class DocumentIntelligenceEngine:
    def __init__(self):
        self.sections: List[DocumentSection] = []
        self.entities: List[EngineeringEntity] = []

    def ingest_engineering_package(self, package_dir: Path) -> List[DocumentSection]:
        """Ingests all engineering documents from package directory."""
        self.sections.clear()

        # 1. Parse Service Manual Markdown
        manual_path = package_dir / "service_manual.md"
        if manual_path.exists():
            self._parse_markdown_manual(manual_path)

        # 2. Parse Work Orders JSON
        wo_path = package_dir / "work_orders.json"
        if wo_path.exists():
            self._parse_json_work_orders(wo_path)

        # 3. Parse Inspection Logs JSON
        insp_path = package_dir / "inspection_logs.json"
        if insp_path.exists():
            self._parse_json_inspection_logs(insp_path)

        # 4. Parse Service Bulletins JSON
        sb_path = package_dir / "service_bulletins.json"
        if sb_path.exists():
            self._parse_json_bulletins(sb_path)

        logger.info(f"Document Intelligence Engine ingested {len(self.sections)} structured document sections.")
        return self.sections

    def _parse_markdown_manual(self, file_path: Path):
        content = file_path.read_text(encoding="utf-8")
        current_title = "Service Manual Overview"
        current_lines = []

        for line in content.splitlines():
            if line.startswith("#"):
                if current_lines:
                    text = "\n".join(current_lines).strip()
                    if text:
                        self.sections.append(DocumentSection(
                            document_name="service_manual.md",
                            section_title=current_title,
                            page_number=1,
                            content=text,
                            warnings=[l for l in current_lines if "Warning" in l or "WARNING" in l],
                            torque_specs=[l for l in current_lines if "Nm" in l or "Torque" in l]
                        ))
                current_title = line.lstrip("#").strip()
                current_lines = []
            else:
                current_lines.append(line)

        if current_lines:
            text = "\n".join(current_lines).strip()
            if text:
                self.sections.append(DocumentSection(
                    document_name="service_manual.md",
                    section_title=current_title,
                    page_number=1,
                    content=text,
                    warnings=[l for l in current_lines if "Warning" in l or "WARNING" in l],
                    torque_specs=[l for l in current_lines if "Nm" in l or "Torque" in l]
                ))

    def _parse_json_work_orders(self, file_path: Path):
        data = json.loads(file_path.read_text(encoding="utf-8"))
        for wo in data:
            self.sections.append(DocumentSection(
                document_name="work_orders.json",
                section_title=f"Work Order {wo.get('work_order_id')}",
                page_number=1,
                content=f"Work Order {wo.get('work_order_id')}: {wo.get('component_name')} ({wo.get('mesh_id')}). Issue: {wo.get('issue_description')}. Status: {wo.get('status')}.",
                parts_mentioned=[wo.get("replacement_part")] if wo.get("replacement_part") else []
            ))

    def _parse_json_inspection_logs(self, file_path: Path):
        data = json.loads(file_path.read_text(encoding="utf-8"))
        for log in data:
            self.sections.append(DocumentSection(
                document_name="inspection_logs.json",
                section_title=f"Inspection {log.get('log_id')}",
                page_number=1,
                content=f"Inspection Log {log.get('log_id')}: Component {log.get('part_number')} ({log.get('mesh_id')}). Findings: {log.get('findings')}. Health Score: {log.get('health_score')}.",
                warnings=[log.get("findings")] if log.get("status") == "Warning" else []
            ))

    def _parse_json_bulletins(self, file_path: Path):
        data = json.loads(file_path.read_text(encoding="utf-8"))
        for sb in data:
            self.sections.append(DocumentSection(
                document_name="service_bulletins.json",
                section_title=f"Service Bulletin {sb.get('bulletin_id')}",
                page_number=1,
                content=f"Service Bulletin {sb.get('bulletin_id')}: {sb.get('title')}. Summary: {sb.get('summary')}. Severity: {sb.get('severity')}.",
                warnings=[sb.get("summary")] if sb.get("severity") in ["High", "Critical"] else []
            ))
