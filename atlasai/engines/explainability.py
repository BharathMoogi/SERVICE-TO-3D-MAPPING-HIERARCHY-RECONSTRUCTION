"""
Module 8: Explainability Engine
Generates transparent, structured reasoning evidence chains for every AI instruction-to-3D mesh mapping decision.
"""

import logging
from typing import List

from atlasai.domain.models import CandidateScore, ParsedInstruction, MeshMetadata, MappingResult
from atlasai.domain.repository import MeshRepository

logger = logging.getLogger("AtlasAI.Explainability")

class ExplainabilityEngine:
    """Synthesizes technical justification evidence for end-user inspection."""

    def build_explanation(
        self,
        instruction: ParsedInstruction,
        winner: CandidateScore,
        mesh: MeshMetadata,
        repository: MeshRepository
    ) -> List[str]:
        """Generates evidence statements combining spatial, geometric, semantic, and LLM reasoning."""
        reasons: List[str] = []

        # 1. Spatial location evidence
        reasons.append(
            f"Spatial Location: Situated in {mesh.spatial_zone.replace('_', ' ')} "
            f"at world coordinates ({mesh.world_position.x:.2f}, {mesh.world_position.y:.2f}, {mesh.world_position.z:.2f})."
        )

        # 2. Geometric shape evidence
        bb = mesh.bounding_box
        reasons.append(
            f"Geometric Profile: Classified as '{mesh.geometric_shape.replace('_', ' ')}' "
            f"with dimensions ({bb.dimensions.x:.2f}m x {bb.dimensions.y:.2f}m x {bb.dimensions.z:.2f}m) "
            f"and volume {bb.volume:.6f} m^3."
        )

        # 3. Semantic similarity evidence
        reasons.append(
            f"Semantic Embedding Match: Dense vector cosine similarity score of {winner.semantic_score:.2f} "
            f"against instruction target '{instruction.target_object}'."
        )

        # 4. Spatial neighbors evidence
        neighbors = repository.get_neighbors(mesh.mesh_id, radius=0.8)
        if neighbors:
            neighbor_ids = ", ".join([n.mesh_id for n in neighbors[:3]])
            reasons.append(f"Structural Context: Positioned adjacent to sub-assembly components ({neighbor_ids}).")

        # 5. LLM reasoning evidence
        if winner.reasoning_points:
            for pt in winner.reasoning_points:
                if pt not in reasons:
                    reasons.append(f"AI Reasoning: {pt}")

        return reasons
