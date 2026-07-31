"""
Mesh Repository Pattern Implementation
Provides indexed lookup, spatial queries, and hierarchy traversal over parsed 3D meshes.
"""

from typing import Dict, List, Optional, Tuple
import numpy as np
from atlasai.domain.models import MeshMetadata, BoundingBox3D

class MeshRepository:
    """Indexed in-memory store for MeshMetadata supporting spatial & structural queries."""

    def __init__(self):
        self._meshes: Dict[str, MeshMetadata] = {}
        self._global_bounds: Optional[Tuple[np.ndarray, np.ndarray]] = None

    def add(self, mesh: MeshMetadata) -> None:
        self._meshes[mesh.mesh_id] = mesh
        self._invalidate_bounds()

    def get(self, mesh_id: str) -> Optional[MeshMetadata]:
        return self._meshes.get(mesh_id)

    def list_all(self) -> List[MeshMetadata]:
        return list(self._meshes.values())

    def __len__(self) -> int:
        return len(self._meshes)

    def _invalidate_bounds(self) -> None:
        self._global_bounds = None

    def get_global_bounds(self) -> Tuple[np.ndarray, np.ndarray]:
        """Returns ((min_x, min_y, min_z), (max_x, max_y, max_z)) for entire assembly."""
        if self._global_bounds is not None:
            return self._global_bounds

        if not self._meshes:
            return (np.zeros(3), np.zeros(3))

        min_pts = []
        max_pts = []
        for mesh in self._meshes.values():
            bb = mesh.bounding_box
            min_pts.append([bb.min_point.x, bb.min_point.y, bb.min_point.z])
            max_pts.append([bb.max_point.x, bb.max_point.y, bb.max_point.z])

        global_min = np.min(np.array(min_pts), axis=0)
        global_max = np.max(np.array(max_pts), axis=0)
        self._global_bounds = (global_min, global_max)
        return self._global_bounds

    def get_neighbors(self, mesh_id: str, radius: float = 0.5) -> List[MeshMetadata]:
        """Finds meshes within a spatial distance radius from given mesh center."""
        target = self.get(mesh_id)
        if not target:
            return []

        tc = np.array([target.world_position.x, target.world_position.y, target.world_position.z])
        neighbors = []
        for m in self._meshes.values():
            if m.mesh_id == mesh_id:
                continue
            mc = np.array([m.world_position.x, m.world_position.y, m.world_position.z])
            dist = float(np.linalg.norm(tc - mc))
            if dist <= radius:
                neighbors.append(m)
        return neighbors

    def get_children_recursive(self, mesh_id: str) -> List[MeshMetadata]:
        """Returns all descendant meshes in structural hierarchy graph."""
        target = self.get(mesh_id)
        if not target:
            return []

        result = []
        stack = list(target.children_ids)
        while stack:
            cid = stack.pop()
            child = self.get(cid)
            if child:
                result.append(child)
                stack.extend(child.children_ids)
        return result
