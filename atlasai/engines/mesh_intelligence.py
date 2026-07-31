"""
Module 2: Mesh Intelligence Engine
Analyzes 3D mesh geometry, proportions, spatial location relative to assembly global bounding box,
creates semantic tags, and automatically generates rich natural language descriptions.
"""

import logging
from typing import List, Dict, Tuple
import numpy as np

from atlasai.domain.models import MeshMetadata
from atlasai.domain.repository import MeshRepository

logger = logging.getLogger("AtlasAI.MeshIntelligence")

class MeshIntelligenceEngine:
    """Classifies geometric forms and synthesizes natural language descriptions for unlabelled meshes."""

    def __init__(self):
        pass

    def analyze_repository(self, repository: MeshRepository) -> None:
        """Processes all meshes in the repository, decorating them with shape tags, spatial zones, and NL descriptions."""
        global_min, global_max = repository.get_global_bounds()
        total_height = float(global_max[2] - global_min[2]) if (global_max[2] - global_min[2]) > 0 else 1.0
        total_volume = float(np.prod(global_max - global_min)) if np.prod(global_max - global_min) > 0 else 1.0

        for mesh in repository.list_all():
            shape_type, tags = self._classify_geometry(mesh)
            spatial_zone = self._classify_spatial_zone(mesh, global_min, global_max, total_height)
            
            mesh.geometric_shape = shape_type
            mesh.spatial_zone = spatial_zone
            mesh.semantic_tags = list(set(tags + [shape_type, spatial_zone]))
            
            # Generate automatic NL description
            mesh.auto_description = self._generate_nl_description(mesh, total_volume)

        logger.info(f"Mesh Intelligence Engine decorated {len(repository)} meshes with geometric tags and NL descriptions.")

    def _classify_geometry(self, mesh: MeshMetadata) -> Tuple[str, List[str]]:
        """Determines geometric classification and shape tags based on aspect ratios, volume, and proportions."""
        bb = mesh.bounding_box
        dx, dy, dz = bb.dimensions.x, bb.dimensions.y, bb.dimensions.z
        dims = sorted([dx, dy, dz], reverse=True)
        max_d, mid_d, min_d = dims[0], dims[1], dims[2]

        tags = []

        # Aspect ratios & flatness
        flatness = min_d / max_d if max_d > 0 else 1.0
        elongation = max_d / mid_d if mid_d > 0 else 1.0

        shape_type = "generic_component"

        if flatness < 0.15:
            if max_d > 0.3 and mid_d > 0.2:
                shape_type = "large_flat_plate"
                tags.extend(["flat", "plate_like", "board_like", "circuit_board", "panel"])
            else:
                shape_type = "thin_plate"
                tags.extend(["flat", "thin_plate", "clip_like", "bracket", "sheet"])
        elif elongation > 3.0:
            if min_d / mid_d > 0.7:
                shape_type = "cylinder_rod"
                tags.extend(["cylindrical", "rod", "shaft", "column", "tube", "round_component"])
            else:
                shape_type = "long_rail"
                tags.extend(["long_rod", "rail", "bar", "structural_beam"])
        elif abs(dx - dy) < 0.2 * max_d and abs(dy - dz) < 0.2 * max_d:
            if bb.volume < 0.001:
                shape_type = "fastener_nut"
                tags.extend(["small_fastener", "mounting_nut", "screw", "bolt", "small_component"])
            else:
                shape_type = "compact_housing"
                tags.extend(["motor_housing", "cube_structure", "block", "enclosure"])
        elif max_d > 0.2 and mid_d > 0.15 and dz < 0.1:
            shape_type = "drawer_tray"
            tags.extend(["drawer_like", "slide_out", "tray", "compartment", "enclosure"])
        else:
            shape_type = "bracket_component"
            tags.extend(["bracket_like", "mount", "connector", "structural"])

        return shape_type, tags

    def _classify_spatial_zone(self, mesh: MeshMetadata, global_min: np.ndarray, global_max: np.ndarray, total_height: float) -> str:
        """Categorizes mesh location along vertical (Z) and depth/breadth axes."""
        z_center = mesh.world_position.z
        rel_z = (z_center - global_min[2]) / total_height

        if rel_z < 0.25:
            return "bottom_assembly"
        elif rel_z > 0.75:
            return "top_assembly"
        else:
            return "middle_assembly"

    def _generate_nl_description(self, mesh: MeshMetadata, total_volume: float) -> str:
        """Synthesizes human-readable description for embedding matching."""
        bb = mesh.bounding_box
        rel_vol_pct = (bb.volume / total_volume) * 100 if total_volume > 0 else 0.1

        pos_str = f"located in the {mesh.spatial_zone.replace('_', ' ')} at position (x={mesh.world_position.x:.2f}, y={mesh.world_position.y:.2f}, z={mesh.world_position.z:.2f})"
        
        tags_str = ", ".join(mesh.semantic_tags)
        
        desc = (
            f"A {mesh.geometric_shape.replace('_', ' ')} object ({pos_str}). "
            f"Dimensions are {bb.dimensions.x:.2f}m x {bb.dimensions.y:.2f}m x {bb.dimensions.z:.2f}m. "
            f"Material: {mesh.material_name}. Semantic characteristics: {tags_str}."
        )
        return desc
