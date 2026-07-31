"""
Module 3: Instruction Intelligence Engine
Parses unstructured human engineering maintenance instructions into structured ParsedInstruction models.
Extracts actions, target component entities, position cues, directional cues, and semantic attribute hints.
"""

import logging
import re
from typing import List, Dict, Any, Optional

from atlasai.domain.models import ParsedInstruction

logger = logging.getLogger("AtlasAI.InstructionIntelligence")

class InstructionIntelligenceEngine:
    """Extracts structured mechanical & spatial entities from natural language service maintenance instructions."""

    # Lexicon patterns for engineering maintenance instructions
    ACTION_PATTERNS = {
        r"\bslide\s+out\b": "slide_out",
        r"\bremove\b": "remove",
        r"\bdetach\b": "detach",
        r"\bloosen\b": "loosen",
        r"\bunbolt\b": "unbolt",
        r"\bunscrew\b": "unscrew",
        r"\bextract\b": "extract",
        r"\bdisconnect\b": "disconnect",
        r"\blift\b": "lift",
    }

    POSITION_PATTERNS = {
        r"\bbottom\b": "bottom",
        r"\btop\b": "top",
        r"\blower\b": "bottom",
        r"\bupper\b": "top",
        r"\binternal\b": "internal",
        r"\binside\b": "internal",
        r"\brear\b": "rear",
        r"\bfront\b": "front",
        r"\bside\b": "side",
    }

    ATTRIBUTE_KEYWORDS = {
        "circuit board": ["flat", "electronic", "pcb", "plate", "green_board"],
        "electronics drawer": ["drawer", "slide_out", "enclosure", "compartment", "bottom"],
        "sample clips": ["clip", "thin_plate", "holder", "stage_clip", "small"],
        "mounting nuts": ["nut", "fastener", "screw", "bolt", "hex_nut", "small"],
        "objective lens": ["lens", "cylinder", "optics", "revolver", "barrel"],
        "motor housing": ["motor", "housing", "block", "power_unit"],
    }

    def parse_instruction(self, step_id: int, instruction_text: str) -> ParsedInstruction:
        """Parses a single natural language instruction string into structured ParsedInstruction model."""
        text_lower = instruction_text.lower().strip()

        # 1. Action extraction
        action = "manipulate"
        for pattern, act in self.ACTION_PATTERNS.items():
            if re.search(pattern, text_lower):
                action = act
                break

        # 2. Position cue extraction
        position_cue = None
        for pattern, pos in self.POSITION_PATTERNS.items():
            if re.search(pattern, text_lower):
                position_cue = pos
                break

        # 3. Target object extraction
        # Remove verbs and common prepositions to isolate target phrase
        cleaned = text_lower
        for pattern in self.ACTION_PATTERNS.keys():
            cleaned = re.sub(pattern, "", cleaned)
        cleaned = re.sub(r"\b(the|a|an|from|of|on|in|to)\b", "", cleaned).strip()
        
        target_object = cleaned if cleaned else instruction_text

        # 4. Attribute hints extraction
        attribute_hints: List[str] = []
        for key, hints in self.ATTRIBUTE_KEYWORDS.items():
            if key in text_lower:
                attribute_hints.extend(hints)

        if position_cue:
            attribute_hints.append(position_cue)

        # Infer general hints if target contains descriptive words
        if "board" in target_object or "pcb" in target_object:
            attribute_hints.extend(["flat", "plate", "electronic"])
        if "drawer" in target_object:
            attribute_hints.extend(["drawer", "compartment", "slide"])
        if "clip" in target_object:
            attribute_hints.extend(["thin", "clip", "stage"])
        if "nut" in target_object or "screw" in target_object or "bolt" in target_object:
            attribute_hints.extend(["fastener", "small", "hex"])

        attribute_hints = list(set(attribute_hints))

        parsed = ParsedInstruction(
            step_id=step_id,
            raw_instruction=instruction_text,
            action=action,
            target_object=target_object,
            position_cue=position_cue,
            direction_cue="outwards" if action == "slide_out" else "downwards",
            attribute_hints=attribute_hints,
            spatial_relationships=[f"near {target_object}"] if target_object else [],
            dependencies=[]
        )

        logger.debug(f"Parsed Step {step_id}: '{instruction_text}' -> Target: '{target_object}', Action: '{action}'")
        return parsed

    def parse_steps_list(self, steps_data: List[Dict[str, Any]] | List[str]) -> List[ParsedInstruction]:
        """Parses a list of instruction items (either strings or dictionaries)."""
        parsed_steps = []
        for idx, item in enumerate(steps_data, start=1):
            if isinstance(item, str):
                parsed = self.parse_instruction(idx, item)
            elif isinstance(item, dict):
                instr = item.get("instruction") or item.get("step") or item.get("text", "")
                step_num = item.get("step", idx)
                parsed = self.parse_instruction(step_num, str(instr))
            else:
                continue
            parsed_steps.append(parsed)

        logger.info(f"Instruction Intelligence Engine parsed {len(parsed_steps)} service instructions.")
        return parsed_steps
