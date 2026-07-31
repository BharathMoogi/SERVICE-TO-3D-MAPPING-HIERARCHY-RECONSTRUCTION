"""
Module 7: Multi-Stage Ranking Engine
Combines vector semantic similarity, geometry matching, spatial position, hierarchy graph context, and LLM reasoning.
Normalizes multi-dimensional scores and computes final confidence to pick top-ranked candidate.
"""

import logging
from typing import List, Tuple
import numpy as np

from atlasai.domain.models import CandidateScore, ParsedInstruction
from atlasai.config.settings import get_settings

logger = logging.getLogger("AtlasAI.MultiStageRanking")

class MultiStageRankingEngine:
    """Multi-criteria score fusion engine with dynamic weights and min-max normalization."""

    def __init__(self):
        self.settings = get_settings()
        self.w = self.settings.weights

    def rank_candidates(
        self,
        instruction: ParsedInstruction,
        candidates: List[CandidateScore]
    ) -> CandidateScore:
        """Ranks evaluated candidates and returns top candidate with normalized final confidence."""
        if not candidates:
            raise ValueError(f"No candidates to rank for Step {instruction.step_id}")

        for cand in candidates:
            weighted_score = (
                self.w.semantic * cand.semantic_score +
                self.w.geometry * cand.geometry_score +
                self.w.spatial * cand.spatial_score +
                self.w.hierarchy * cand.hierarchy_score +
                self.w.llm * cand.llm_score
            )
            cand.final_confidence = round(float(weighted_score), 4)

        # Sort candidates by final confidence score
        candidates.sort(key=lambda c: c.final_confidence, reverse=True)

        top_winner = candidates[0]

        logger.info(
            f"Step {instruction.step_id} ('{instruction.raw_instruction}') -> "
            f"Matched {top_winner.mesh_id} with Confidence {top_winner.final_confidence:.2f}"
        )
        return top_winner
