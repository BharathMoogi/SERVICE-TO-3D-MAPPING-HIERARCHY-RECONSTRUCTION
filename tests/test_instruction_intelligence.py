"""
Unit tests for Instruction Intelligence Engine
"""

from atlasai.engines.instruction_intelligence import InstructionIntelligenceEngine

def test_parse_instruction():
    engine = InstructionIntelligenceEngine()

    parsed1 = engine.parse_instruction(1, "Slide out the electronics drawer")
    assert parsed1.action == "slide_out"
    assert "drawer" in parsed1.target_object
    assert "drawer" in parsed1.attribute_hints

    parsed2 = engine.parse_instruction(2, "Remove the bottom circuit board")
    assert parsed2.action == "remove"
    assert "circuit board" in parsed2.target_object
    assert parsed2.position_cue == "bottom"
    assert "flat" in parsed2.attribute_hints
