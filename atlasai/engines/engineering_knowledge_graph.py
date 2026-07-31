"""
Module 5: Unified Engineering Knowledge Graph Engine
Builds one unified NetworkX graph connecting Meshes, Parts, Documents, Procedures, Warnings, Work Orders, and Service Bulletins.
Node Types: Mesh, Part, Document, WorkOrder, ServiceBulletin, Warning.
Edges: Contains, Parent, Child, Mentioned_In, Replaced_By, Depends_On, Requires, Supports, Blocks.
Exports output/engineering_graph.json.
"""

import json
import logging
from pathlib import Path
import networkx as nx
from typing import List, Dict, Any

from atlasai.domain.models import PartCrossReference, EngineeringEntity

logger = logging.getLogger("AtlasAI.EngineeringKnowledgeGraph")


class UnifiedEngineeringGraphEngine:
    def __init__(self):
        self.graph = nx.DiGraph()

    def build_unified_graph(self, xref_list: List[PartCrossReference], entities: List[EngineeringEntity]) -> nx.DiGraph:
        """Constructs unified NetworkX engineering graph."""
        self.graph.clear()

        # Add Root Assemblies
        self.graph.add_node("CAD_Assembly", type="Assembly", title="Digital Twin Root")
        self.graph.add_node("Bottom_Assembly", type="SubAssembly", title="Bottom Electronics Frame")
        self.graph.add_node("Middle_Assembly", type="SubAssembly", title="Stage & Optical Arm")

        self.graph.add_edge("CAD_Assembly", "Bottom_Assembly", relation="Contains")
        self.graph.add_edge("CAD_Assembly", "Middle_Assembly", relation="Contains")

        # Add Part Cross-References & Meshes
        for xref in xref_list:
            mesh_node = xref.mesh_id
            part_node = f"PART_{xref.part_number}"
            doc_node = f"DOC_Section_{xref.manual_section.replace(' ', '_')}"

            # Nodes
            self.graph.add_node(mesh_node, type="Mesh", part_number=xref.part_number, title=xref.component_name)
            self.graph.add_node(part_node, type="PartNumber", name=xref.component_name)
            self.graph.add_node(doc_node, type="ManualSection", section=xref.manual_section, page=xref.manual_page)

            # Edges
            self.graph.add_edge(part_node, mesh_node, relation="Represented_By_Mesh")
            self.graph.add_edge(mesh_node, doc_node, relation="Mentioned_In")

            if xref.work_order_id:
                wo_node = f"WO_{xref.work_order_id}"
                self.graph.add_node(wo_node, type="WorkOrder", work_order_id=xref.work_order_id)
                self.graph.add_edge(mesh_node, wo_node, relation="Replaced_By_WO")

        # Add Warnings & Dependencies from Entities
        for ent in entities:
            if ent.mesh_id and ent.safety_warning:
                warn_node = f"WARN_{ent.entity_id}"
                self.graph.add_node(warn_node, type="Warning", text=ent.safety_warning)
                self.graph.add_edge(ent.mesh_id, warn_node, relation="Requires_Warning")

        logger.info(f"Unified Engineering Graph Engine built graph with {self.graph.number_of_nodes()} nodes and {self.graph.number_of_edges()} edges.")
        return self.graph

    def export_graph_json(self, output_path: Path):
        """Exports engineering_graph.json deliverable."""
        data = {
            "total_nodes": self.graph.number_of_nodes(),
            "total_edges": self.graph.number_of_edges(),
            "nodes": [
                {"id": node, **self.graph.nodes[node]}
                for node in self.graph.nodes
            ],
            "edges": [
                {"source": u, "target": v, "relation": d.get("relation", "Connected_To")}
                for u, v, d in self.graph.edges(data=True)
            ]
        }
        output_path.parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)

        logger.info(f"Exported engineering_graph.json to: {output_path}")
