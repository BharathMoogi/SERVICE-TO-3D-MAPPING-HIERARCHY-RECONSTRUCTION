"""
Feature 6: Mesh Auto-Renaming Engine
Generates renamed_mapping.json mapping generic mesh IDs (e.g. Mesh_143, Mesh_032) to human-readable component names.
Does NOT mutate original GLB binary files.
"""

import json
import logging
from pathlib import Path
from typing import List, Dict, Any

from atlasai.domain.models import MappingResult
from atlasai.domain.repository import MeshRepository

logger = logging.getLogger("AtlasAI.AutoRename")

class MeshAutoRenameEngine:
    """Derives intuitive component titles for generic meshes using AI instruction mappings and shape taxonomy."""

    COMPONENT_NAME_MAP = {
        "electronics drawer": "Electronics_Drawer",
        "circuit board": "Circuit_Board",
        "sample clips": "Sample_Clip",
        "mounting nuts": "Mounting_Nut",
        "objective lens": "Objective_Lens_Barrel",
        "motor housing": "Motor_Housing_Bracket",
    }

    def generate_renamed_mappings(
        self,
        mapping_results: List[MappingResult],
        repository: MeshRepository
    ) -> List[Dict[str, Any]]:
        """Produces renamed component catalog mapping generic IDs to descriptive engineering titles."""
        renamed_catalog = []
        renamed_mesh_ids: Dict[str, str] = {}

        # 1. Map matched target meshes directly from AI instructions
        for res in mapping_results:
            target_str = res.parsed_instruction.target_object.lower() if res.parsed_instruction else res.instruction.lower()
            
            clean_name = "Component"
            for k, v in self.COMPONENT_NAME_MAP.items():
                if k in target_str:
                    clean_name = v
                    break
            
            if clean_name == "Component":
                words = [w.capitalize() for w in target_str.replace("the", "").split() if len(w) > 2]
                clean_name = "_".join(words[:3]) if words else "Maintenance_Target"

            # Handle duplicate renames with incrementing indices
            final_name = clean_name
            count = 1
            while final_name in renamed_mesh_ids.values():
                count += 1
                final_name = f"{clean_name}_{count}"

            renamed_mesh_ids[res.mesh] = final_name

        # 2. Map remaining unmapped meshes in repository using geometric taxonomy
        for mesh in repository.list_all():
            if mesh.mesh_id in renamed_mesh_ids:
                continue

            shape = mesh.geometric_shape.title().replace(" ", "_")
            zone = mesh.spatial_zone.title().replace("_", "")
            base_title = f"{zone}_{shape}"

            final_name = base_title
            count = 1
            while final_name in renamed_mesh_ids.values():
                count += 1
                final_name = f"{base_title}_{count}"

            renamed_mesh_ids[mesh.mesh_id] = final_name

        # Construct structured export list
        for mesh_id, semantic_name in renamed_mesh_ids.items():
            mesh_data = repository.get(mesh_id)
            renamed_catalog.append({
                "original_mesh_id": mesh_id,
                "semantic_name": semantic_name,
                "geometric_shape": mesh_data.geometric_shape if mesh_data else "generic",
                "spatial_zone": mesh_data.spatial_zone if mesh_data else "middle_assembly",
                "auto_description": mesh_data.auto_description if mesh_data else ""
            })

        logger.info(f"MeshAutoRenameEngine generated human titles for {len(renamed_catalog)} CAD meshes.")
        return renamed_catalog

    def export_renamed_mapping_json(self, renamed_catalog: List[Dict[str, Any]], output_path: str | Path) -> Path:
        """Exports renamed_mapping.json."""
        path = Path(output_path)
        path.parent.mkdir(parents=True, exist_ok=True)

        with open(path, "w", encoding="utf-8") as f:
            json.dump(renamed_catalog, f, indent=2)

        logger.info(f"Exported renamed_mapping.json: {path}")
        return path
