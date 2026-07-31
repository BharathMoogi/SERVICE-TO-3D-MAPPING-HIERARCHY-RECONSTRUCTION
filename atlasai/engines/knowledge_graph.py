"""
Feature 4: Mesh Knowledge Graph Engine
Builds spatial and structural graph representation using NetworkX.
Export mesh_graph.json with nodes and edge relations (Parent, Child, Adjacent, Touches, Contains, Supports, Blocks).
"""

import json
import logging
from pathlib import Path
from typing import Dict, Any, List, Tuple
import numpy as np
import networkx as nx

from atlasai.domain.repository import MeshRepository
from atlasai.domain.models import MeshMetadata

logger = logging.getLogger("AtlasAI.KnowledgeGraph")

class MeshKnowledgeGraphEngine:
    """Constructs NetworkX directed multigraph over 3D CAD meshes and exports mesh_graph.json."""

    def build_graph(self, repository: MeshRepository) -> nx.DiGraph:
        """Constructs NetworkX graph with node attributes and spatial/structural edge relations."""
        G = nx.DiGraph()
        mesh_list = repository.list_all()

        # Add nodes
        for mesh in mesh_list:
            bb = mesh.bounding_box
            G.add_node(
                mesh.mesh_id,
                geometric_shape=mesh.geometric_shape,
                spatial_zone=mesh.spatial_zone,
                world_position=[mesh.world_position.x, mesh.world_position.y, mesh.world_position.z],
                dimensions=[bb.dimensions.x, bb.dimensions.y, bb.dimensions.z],
                volume=bb.volume,
                auto_description=mesh.auto_description,
                semantic_tags=mesh.semantic_tags
            )

        # Add Parent-Child hierarchy edges
        for mesh in mesh_list:
            if mesh.parent_id and mesh.parent_id in G:
                G.add_edge(mesh.parent_id, mesh.mesh_id, relation="Parent")
                G.add_edge(mesh.mesh_id, mesh.parent_id, relation="Child")

            for cid in mesh.children_ids:
                if cid in G:
                    G.add_edge(mesh.mesh_id, cid, relation="Parent")
                    G.add_edge(cid, mesh.mesh_id, relation="Child")

        # Infer spatial topological edges (Adjacent, Touches, Contains, Supports, Blocks)
        for i in range(len(mesh_list)):
            m1 = mesh_list[i]
            p1 = np.array([m1.world_position.x, m1.world_position.y, m1.world_position.z])
            b1 = m1.bounding_box

            for j in range(i + 1, len(mesh_list)):
                m2 = mesh_list[j]
                p2 = np.array([m2.world_position.x, m2.world_position.y, m2.world_position.z])
                b2 = m2.bounding_box

                dist = float(np.linalg.norm(p1 - p2))

                # Touch/Adjacency threshold based on dimensions
                touch_dist = 0.5 * max(b1.dimensions.x, b1.dimensions.y, b1.dimensions.z) + \
                             0.5 * max(b2.dimensions.x, b2.dimensions.y, b2.dimensions.z)

                if dist <= touch_dist * 1.1:
                    G.add_edge(m1.mesh_id, m2.mesh_id, relation="Adjacent")
                    G.add_edge(m2.mesh_id, m1.mesh_id, relation="Adjacent")

                    if dist <= touch_dist * 0.95:
                        G.add_edge(m1.mesh_id, m2.mesh_id, relation="Touches")
                        G.add_edge(m2.mesh_id, m1.mesh_id, relation="Touches")

                # Vertical Support relation (m1 below m2)
                if abs(p1[0] - p2[0]) < 0.3 and abs(p1[1] - p2[1]) < 0.3:
                    if p1[2] < p2[2] and (p2[2] - p1[2]) < 0.4:
                        G.add_edge(m1.mesh_id, m2.mesh_id, relation="Supports")
                        G.add_edge(m2.mesh_id, m1.mesh_id, relation="Blocks")
                    elif p2[2] < p1[2] and (p1[2] - p2[2]) < 0.4:
                        G.add_edge(m2.mesh_id, m1.mesh_id, relation="Supports")
                        G.add_edge(m1.mesh_id, m2.mesh_id, relation="Blocks")

                # Spatial Containment relation
                if b1.volume > 5.0 * b2.volume and dist < max(b1.dimensions.x, b1.dimensions.y):
                    G.add_edge(m1.mesh_id, m2.mesh_id, relation="Contains")

        logger.info(f"Mesh Knowledge Graph built with {G.number_of_nodes()} nodes and {G.number_of_edges()} edges.")
        return G

    def export_mesh_graph_json(self, G: nx.DiGraph, output_path: str | Path) -> Path:
        """Exports NetworkX graph data to mesh_graph.json format."""
        path = Path(output_path)
        path.parent.mkdir(parents=True, exist_ok=True)

        nodes_data = []
        for n, attrs in G.nodes(data=True):
            nodes_data.append({
                "id": n,
                **attrs
            })

        edges_data = []
        for u, v, attrs in G.edges(data=True):
            edges_data.append({
                "source": u,
                "target": v,
                "relation": attrs.get("relation", "Connected")
            })

        export_structure = {
            "total_nodes": G.number_of_nodes(),
            "total_edges": G.number_of_edges(),
            "nodes": nodes_data,
            "edges": edges_data
        }

        with open(path, "w", encoding="utf-8") as f:
            json.dump(export_structure, f, indent=2)

        logger.info(f"Exported mesh_graph.json: {path}")
        return path
