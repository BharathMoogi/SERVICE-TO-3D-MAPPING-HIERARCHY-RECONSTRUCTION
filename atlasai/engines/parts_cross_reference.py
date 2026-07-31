"""
Module 3: Part Cross Reference Engine
Reads parts_xref.csv and builds 6-way bidirectional lookup mappings:
Component Name <-> Part Number <-> Mesh ID <-> Assembly <-> Manual Page <-> Work Order.
"""

import csv
import logging
from pathlib import Path
from typing import List, Dict, Optional, Any

from atlasai.domain.models import PartCrossReference

logger = logging.getLogger("AtlasAI.PartsCrossReference")


class PartsCrossReferenceEngine:
    def __init__(self):
        self.xref_list: List[PartCrossReference] = []
        self.by_mesh: Dict[str, PartCrossReference] = {}
        self.by_part_num: Dict[str, PartCrossReference] = {}
        self.by_name: Dict[str, PartCrossReference] = {}

    def load_cross_reference_catalog(self, csv_path: Path) -> List[PartCrossReference]:
        self.xref_list.clear()
        self.by_mesh.clear()
        self.by_part_num.clear()
        self.by_name.clear()

        if not csv_path.exists():
            logger.warning(f"Parts cross reference CSV not found at {csv_path}. Using internal fallback.")
            return self.xref_list

        with open(csv_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                xref = PartCrossReference(
                    component_name=row.get("Component_Name", ""),
                    part_number=row.get("Part_Number", ""),
                    mesh_id=row.get("Mesh_ID", ""),
                    assembly_name=row.get("Assembly_Name", ""),
                    manual_page=int(row.get("Manual_Page", 1)),
                    manual_section=row.get("Manual_Section", ""),
                    work_order_id=row.get("Work_Order_ID")
                )
                self.xref_list.append(xref)
                self.by_mesh[xref.mesh_id] = xref
                self.by_part_num[xref.part_number] = xref
                self.by_name[xref.component_name.lower()] = xref

        logger.info(f"Parts Cross Reference Engine loaded {len(self.xref_list)} bidirectional mappings.")
        return self.xref_list

    def get_by_mesh(self, mesh_id: str) -> Optional[PartCrossReference]:
        return self.by_mesh.get(mesh_id)

    def get_by_part_number(self, part_num: str) -> Optional[PartCrossReference]:
        return self.by_part_num.get(part_num)

    def search_component(self, query: str) -> Optional[PartCrossReference]:
        q = query.lower().strip()
        for name, xref in self.by_name.items():
            if q in name or name in q:
                return xref
        return None
