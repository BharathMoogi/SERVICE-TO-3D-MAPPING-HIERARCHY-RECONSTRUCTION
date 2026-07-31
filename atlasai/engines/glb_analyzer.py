"""
Module 1: GLB Analysis Engine
Parses 3D GLB models, traverses node hierarchy, calculates world matrices, bounding boxes, volume, surface area, and populates MeshRepository.
"""

import logging
from pathlib import Path
from typing import Dict, Any, List, Optional
import numpy as np
import trimesh

from atlasai.domain.models import MeshMetadata, BoundingBox3D, Vector3D
from atlasai.domain.repository import MeshRepository

logger = logging.getLogger("AtlasAI.GLBAnalyzer")

class GLBAnalysisEngine:
    """Production-grade GLB scene parser using trimesh & spatial transformation geometry."""

    def __init__(self):
        pass

    def load_and_analyze(self, glb_path: str | Path) -> MeshRepository:
        """Loads a GLB file, extracts all mesh nodes with geometry and hierarchy, returns MeshRepository."""
        path = Path(glb_path)
        if not path.exists():
            raise FileNotFoundError(f"GLB model not found at path: {path}")

        logger.info(f"Loading GLB model: {path.name}")
        
        # Load scene with trimesh
        scene = trimesh.load(str(path), process=False)
        repository = MeshRepository()

        if isinstance(scene, trimesh.Trimesh):
            # Single mesh file fallback
            mesh_meta = self._convert_single_trimesh(scene, mesh_id="Mesh_001", node_id="Node_001")
            repository.add(mesh_meta)
            return repository

        if not isinstance(scene, trimesh.Scene):
            raise ValueError(f"Unsupported geometry type returned by trimesh: {type(scene)}")

        # Process multi-node Scene hierarchy
        graph = scene.graph
        mesh_counter = 1

        # Map nodes to parent/children relationships
        parent_map: Dict[str, str] = {}
        children_map: Dict[str, List[str]] = {}

        for node_id in graph.nodes:
            children_map[node_id] = []

        for node_id in graph.nodes:
            parents = graph.transforms.parents.get(node_id)
            if parents:
                parent_map[node_id] = parents
                if parents in children_map:
                    children_map[parents].append(node_id)

        # Traverse scene geometry
        for node_id in graph.nodes_geometry:
            # Get geometry name and matrix
            transform, geometry_name = scene.graph.get(node_id)
            if geometry_name not in scene.geometry:
                continue

            geo: trimesh.Trimesh = scene.geometry[geometry_name]
            mesh_id = f"Mesh_{mesh_counter:03d}"
            mesh_counter += 1

            # Calculate transform and world coordinates
            world_transform = scene.graph.get(node_id)[0]
            mesh_meta = self._extract_mesh_metadata(
                mesh_id=mesh_id,
                node_id=str(node_id),
                raw_name=str(geometry_name),
                geometry=geo,
                world_transform=world_transform,
                parent_id=parent_map.get(str(node_id)),
                children_ids=children_map.get(str(node_id), [])
            )
            repository.add(mesh_meta)

        logger.info(f"GLB Analysis Engine successfully extracted {len(repository)} meshes into MeshRepository.")
        return repository

    def _extract_mesh_metadata(
        self,
        mesh_id: str,
        node_id: str,
        raw_name: str,
        geometry: trimesh.Trimesh,
        world_transform: np.ndarray,
        parent_id: Optional[str],
        children_ids: List[str]
    ) -> MeshMetadata:
        """Applies world transform matrix to geometry bounding box and computes physical metrics."""
        
        # Apply transformation to vertices copy to compute world bounding box
        transformed_verts = trimesh.transformations.transform_points(geometry.vertices, world_transform)
        
        min_pt = np.min(transformed_verts, axis=0) if len(transformed_verts) > 0 else np.zeros(3)
        max_pt = np.max(transformed_verts, axis=0) if len(transformed_verts) > 0 else np.zeros(3)
        center = (min_pt + max_pt) / 2.0
        dims = np.maximum(max_pt - min_pt, 1e-4)

        # Compute volume and surface area
        try:
            surface_area = float(geometry.area)
        except Exception:
            surface_area = float(2 * (dims[0]*dims[1] + dims[1]*dims[2] + dims[2]*dims[0]))

        try:
            volume = float(geometry.volume) if geometry.is_watertight else float(dims[0] * dims[1] * dims[2])
        except Exception:
            volume = float(dims[0] * dims[1] * dims[2])

        # Aspect ratios
        aspect_xy = float(dims[0] / dims[1]) if dims[1] > 0 else 1.0
        aspect_xz = float(dims[0] / dims[2]) if dims[2] > 0 else 1.0

        # Translation / Rotation extraction
        world_pos = Vector3D(x=float(center[0]), y=float(center[1]), z=float(center[2]))
        
        # Euler rotations from matrix
        try:
            euler = trimesh.transformations.euler_from_matrix(world_transform)
            rot = Vector3D(x=float(euler[0]), y=float(euler[1]), z=float(euler[2]))
        except Exception:
            rot = Vector3D(x=0.0, y=0.0, z=0.0)

        bbox = BoundingBox3D(
            min_point=Vector3D(x=float(min_pt[0]), y=float(min_pt[1]), z=float(min_pt[2])),
            max_point=Vector3D(x=float(max_pt[0]), y=float(max_pt[1]), z=float(max_pt[2])),
            center=world_pos,
            dimensions=Vector3D(x=float(dims[0]), y=float(dims[1]), z=float(dims[2])),
            volume=abs(volume),
            surface_area=abs(surface_area),
            aspect_ratio_xy=aspect_xy,
            aspect_ratio_xz=aspect_xz,
        )

        material_name = "standard_pbr_material"
        if hasattr(geometry, 'visual') and hasattr(geometry.visual, 'material') and hasattr(geometry.visual.material, 'name'):
            if geometry.visual.material.name:
                material_name = str(geometry.visual.material.name)

        return MeshMetadata(
            mesh_id=mesh_id,
            node_id=node_id,
            raw_name=raw_name,
            parent_id=parent_id,
            children_ids=children_ids,
            bounding_box=bbox,
            world_position=world_pos,
            rotation_euler=rot,
            material_name=material_name,
            transform_matrix=world_transform.tolist()
        )

    def _convert_single_trimesh(self, geometry: trimesh.Trimesh, mesh_id: str, node_id: str) -> MeshMetadata:
        return self._extract_mesh_metadata(
            mesh_id=mesh_id,
            node_id=node_id,
            raw_name=mesh_id,
            geometry=geometry,
            world_transform=np.eye(4),
            parent_id=None,
            children_ids=[]
        )
