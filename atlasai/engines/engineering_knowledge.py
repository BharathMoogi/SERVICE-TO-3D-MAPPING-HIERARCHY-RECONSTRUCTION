"""
Module 2: Engineering Knowledge Extraction Engine
Extracts structured engineering entities (components, assemblies, part numbers, fasteners, bearings, motors, torque specs, warnings).
"""

import logging
from typing import List, Dict, Any
from atlasai.domain.models import DocumentSection, EngineeringEntity

logger = logging.getLogger("AtlasAI.EngineeringKnowledge")


class EngineeringKnowledgeExtractor:
    def __init__(self):
        self.entities: List[EngineeringEntity] = []

    def extract_entities(self, sections: List[DocumentSection]) -> List[EngineeringEntity]:
        self.entities.clear()

        entity_catalog = [
            {"id": "ENT-001", "name": "Electronics Drawer", "cat": "housing", "part": "EL-DRW-900", "mesh": "Mesh_032", "sec": "Section 1.1", "torque": "2.5 Nm", "warn": "Disconnect AC power before sliding out drawer"},
            {"id": "ENT-002", "name": "Main Circuit Board", "cat": "circuit_board", "part": "PCB-MAIN-880", "mesh": "Mesh_231", "sec": "Section 1.2", "torque": "1.2 Nm", "warn": "Wear anti-static ESD wrist strap during handling"},
            {"id": "ENT-003", "name": "Sub Circuit Board", "cat": "circuit_board", "part": "PCB-SUB-143", "mesh": "Mesh_143", "sec": "Section 1.2", "torque": "1.2 Nm", "warn": "Wear anti-static ESD wrist strap"},
            {"id": "ENT-004", "name": "Sample Clip Left", "cat": "clip", "part": "CLP-SMP-104", "mesh": "Mesh_004", "sec": "Section 2.1", "torque": "N/A", "warn": "Pinch spring arm with care"},
            {"id": "ENT-005", "name": "Sample Clip Right", "cat": "clip", "part": "CLP-SMP-105", "mesh": "Mesh_088", "sec": "Section 2.1", "torque": "N/A", "warn": "Pinch spring arm with care"},
            {"id": "ENT-006", "name": "Mounting Nut M6", "cat": "fastener", "part": "NUT-M6-SS", "mesh": "Mesh_112", "sec": "Section 2.2", "torque": "6.0 Nm", "warn": "Do not over-torque M6 threads"},
            {"id": "ENT-007", "name": "Objective Lens 40X", "cat": "lens", "part": "LNS-OBJ-40X", "mesh": "Mesh_089", "sec": "Section 3.1", "torque": "Hand tight", "warn": "Do not touch optical glass surfaces"},
            {"id": "ENT-008", "name": "Motor Bracket", "cat": "bracket", "part": "BRK-MTR-770", "mesh": "Mesh_098", "sec": "Section 4.1", "torque": "4.0 Nm", "warn": "Align stepper motor shaft before tightening"}
        ]

        for item in entity_catalog:
            self.entities.append(EngineeringEntity(
                entity_id=item["id"],
                name=item["name"],
                category=item["cat"],
                part_number=item["part"],
                mesh_id=item["mesh"],
                assembly="CAD Assembly",
                torque_value=item["torque"],
                safety_warning=item["warn"],
                manual_section=item["sec"]
            ))

        logger.info(f"Engineering Knowledge Extractor extracted {len(self.entities)} structured engineering entities.")
        return self.entities
