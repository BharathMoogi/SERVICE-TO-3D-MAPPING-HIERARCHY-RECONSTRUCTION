"""
Domain Models for AtlasAI Engine
Strict Pydantic models for geometric data, mesh metadata, service instructions, multi-stage scoring,
reasoning timeline, evidence chains, and REST explainability responses.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class Vector3D(BaseModel):
    x: float
    y: float
    z: float

class BoundingBox3D(BaseModel):
    min_point: Vector3D
    max_point: Vector3D
    center: Vector3D
    dimensions: Vector3D
    volume: float = Field(default=0.0)
    surface_area: float = Field(default=0.0)
    aspect_ratio_xy: float = Field(default=1.0)
    aspect_ratio_xz: float = Field(default=1.0)

class MeshMetadata(BaseModel):
    mesh_id: str
    node_id: str
    raw_name: str
    parent_id: Optional[str] = None
    children_ids: List[str] = Field(default_factory=list)
    bounding_box: BoundingBox3D
    world_position: Vector3D
    rotation_euler: Vector3D
    material_name: Optional[str] = "default_material"
    transform_matrix: List[List[float]] = Field(default_factory=list)
    
    # Inferred characteristics (Mesh Intelligence Engine)
    geometric_shape: str = "generic_component"
    spatial_zone: str = "middle_assembly"
    semantic_tags: List[str] = Field(default_factory=list)
    auto_description: str = ""

class ParsedInstruction(BaseModel):
    step_id: int
    raw_instruction: str
    action: str
    target_object: str
    position_cue: Optional[str] = None
    direction_cue: Optional[str] = None
    assembly_context: Optional[str] = "main_assembly"
    mechanical_intent: Optional[str] = "component_disassembly"
    attribute_hints: List[str] = Field(default_factory=list)
    spatial_relationships: List[str] = Field(default_factory=list)
    dependencies: List[int] = Field(default_factory=list)

class CandidateScore(BaseModel):
    mesh_id: str
    mesh_description: str
    semantic_score: float = 0.0
    geometry_score: float = 0.0
    spatial_score: float = 0.0
    graph_score: float = 0.0
    hierarchy_score: float = 0.0
    llm_score: float = 0.0
    final_confidence: float = 0.0
    reasoning_points: List[str] = Field(default_factory=list)
    rejection_reason: Optional[str] = None

class TimelineStep(BaseModel):
    stage_name: str
    description: str
    candidate_count: int
    timestamp_ms: float = 0.0

class EvidenceItem(BaseModel):
    category: str
    statement: str
    verified: bool = True

class MappingResult(BaseModel):
    step: int
    instruction: str
    mesh: str
    confidence: float
    reason: List[str]
    top_candidates: List[CandidateScore] = Field(default_factory=list)
    parsed_instruction: Optional[ParsedInstruction] = None
    timeline: List[TimelineStep] = Field(default_factory=list)
    evidence: List[EvidenceItem] = Field(default_factory=list)
    validated: bool = True

class VisualDebuggerReport(BaseModel):
    total_meshes: int
    mesh_catalog: List[MeshMetadata]
    execution_timestamp: str
    version: str = "1.0.0"

class ExplainabilityResponse(BaseModel):
    step: int
    instruction: str
    matched_mesh: str
    semantic_name: str
    confidence: float
    reasoning_timeline: List[TimelineStep]
    evidence_chain: List[EvidenceItem]
    top_candidates: List[CandidateScore]
    rejected_candidates: List[CandidateScore]
