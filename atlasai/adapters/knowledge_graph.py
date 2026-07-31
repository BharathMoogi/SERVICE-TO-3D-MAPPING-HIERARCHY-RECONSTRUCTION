"""
Future-Ready Adapter: Knowledge Graph Integration
Exports 3D spatial hierarchy and assembly relationship graph into RDF/Neo4j triplets.
"""

import logging
from typing import List, Tuple
from atlasai.domain.repository import MeshRepository

logger = logging.getLogger("AtlasAI.Adapter.KnowledgeGraph")

class KnowledgeGraphAdapter:
    """Exports spatial and structural CAD graphs into Knowledge Graph triplets (Subject, Predicate, Object)."""

    def export_triplets(self, repository: MeshRepository) -> List[Tuple[str, str, str]]:
        triplets = []
        for mesh in repository.list_all():
            m_id = mesh.mesh_id
            triplets.append((m_id, "has_shape", mesh.geometric_shape))
            triplets.append((m_id, "located_in", mesh.spatial_zone))
            
            if mesh.parent_id:
                triplets.append((m_id, "child_of", mesh.parent_id))
            for cid in mesh.children_ids:
                triplets.append((m_id, "parent_of", cid))

            for neighbor in repository.get_neighbors(m_id, radius=0.6)[:3]:
                triplets.append((m_id, "adjacent_to", neighbor.mesh_id))

        logger.info(f"KnowledgeGraphAdapter generated {len(triplets)} triplets from 3D scene graph.")
        return triplets
