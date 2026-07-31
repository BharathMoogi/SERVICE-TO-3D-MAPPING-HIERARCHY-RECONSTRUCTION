"""
AtlasAI Enterprise Domain Models
Defines Pydantic schemas for CAD meshes, maintenance instructions, document intelligence,
part cross-references, multi-doc RAG, engineering knowledge graphs, AI copilot responses,
and component lifecycle timelines.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class Vector3D(BaseModel):
    x: float = 0.0
    y: float = 0.0
    z: float = 0.0


class BoundingBox3D(BaseModel):
    min_point: Vector3D = Field(default_factory=Vector3D)
    max_point: Vector3D = Field(default_factory=Vector3D)
    center: Vector3D = Field(default_factory=Vector3D)
    dimensions: Vector3D = Field(default_factory=Vector3D)
    volume: float = 0.0
    surface_area: float = 0.0
    aspect_ratio_xy: float = 1.0
    aspect_ratio_xz: float = 1.0


class MeshMetadata(BaseModel):
    model_config = {"extra": "allow"}

    mesh_id: str
    node_id: Optional[str] = None
    raw_name: Optional[str] = None
    parent_id: Optional[str] = None
    children_ids: List[str] = Field(default_factory=list)
    vertex_count: int = 0
    triangle_count: int = 0
    bounding_box_min: List[float] = Field(default_factory=lambda: [0.0, 0.0, 0.0])
    bounding_box_max: List[float] = Field(default_factory=lambda: [0.0, 0.0, 0.0])
    bounding_box_dimensions: List[float] = Field(default_factory=lambda: [0.0, 0.0, 0.0])
    center_of_mass: List[float] = Field(default_factory=lambda: [0.0, 0.0, 0.0])
    volume: float = 0.0
    surface_area: float = 0.0
    aspect_ratio: float = 1.0
    geometric_shape: Optional[str] = None
    spatial_zone: Optional[str] = None
    bounding_box: Any = None
    world_position: Any = None
    rotation_euler: Any = None
    material_name: Optional[str] = "standard_pbr_material"
    transform_matrix: List[List[float]] = Field(default_factory=list)
    parent_assembly: Optional[str] = None
    children: List[str] = Field(default_factory=list)
    adjacent_meshes: List[str] = Field(default_factory=list)
    semantic_tags: List[str] = Field(default_factory=list)
    description: Optional[str] = None


class InstructionStep(BaseModel):
    step_number: int = 1
    step_id: Optional[int] = 1
    raw_instruction: str = ""
    target_action: Optional[str] = None
    target_object: Optional[str] = None
    action: Optional[str] = None
    position_cue: Optional[str] = None
    direction_cue: Optional[str] = None
    assembly_context: Optional[str] = None
    attribute_hints: List[str] = Field(default_factory=list)
    spatial_relationships: List[str] = Field(default_factory=list)
    dependencies: List[str] = Field(default_factory=list)
    mechanical_intent: Optional[str] = None


ParsedInstruction = InstructionStep


# Module 1 & 2: Document Intelligence & Entity Models
class DocumentSection(BaseModel):
    document_name: str
    section_title: str
    page_number: Optional[int] = 1
    content: str
    parts_mentioned: List[str] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)
    torque_specs: List[str] = Field(default_factory=list)


class EngineeringEntity(BaseModel):
    entity_id: str
    name: str
    category: str
    part_number: Optional[str] = None
    mesh_id: Optional[str] = None
    assembly: Optional[str] = None
    torque_value: Optional[str] = None
    safety_warning: Optional[str] = None
    manual_section: Optional[str] = None


# Module 3: Part Cross Reference Model
class PartCrossReference(BaseModel):
    component_name: str
    part_number: str
    mesh_id: str
    assembly_name: str
    manual_page: int
    manual_section: str
    work_order_id: Optional[str] = None
    inspection_status: Optional[str] = "Pass"


# Module 4: Document RAG Chunk
class DocumentChunk(BaseModel):
    chunk_id: str
    document_type: str
    title: str
    page_number: int
    text_content: str
    embedding: List[float] = Field(default_factory=list)
    similarity_score: float = 0.0


# Module 7: AI Engineering Copilot Response
class CopilotResponse(BaseModel):
    query: str
    answer: str
    highlight_meshes: List[str] = Field(default_factory=list)
    referenced_documents: List[Dict[str, Any]] = Field(default_factory=list)
    part_numbers: List[str] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)
    confidence: float = 0.95


# Module 10: Component Lifecycle Event
class LifecycleEvent(BaseModel):
    timestamp: str
    event_type: str
    description: str
    work_order_id: Optional[str] = None
    technician: Optional[str] = None
    status: str = "Completed"


class ComponentLifecycle(BaseModel):
    mesh_id: str
    component_name: str
    part_number: str
    current_status: str
    events: List[LifecycleEvent] = Field(default_factory=list)


# Module 11: Global Search Result
class GlobalSearchResult(BaseModel):
    result_id: str
    title: str
    category: str
    description: str
    mesh_id: Optional[str] = None
    relevance_score: float = 1.0


# Candidate & Timeline Funnel Models
class TimelineStep(BaseModel):
    stage_name: str
    description: str
    candidate_count: int


class EvidenceItem(BaseModel):
    category: str
    statement: str
    verified: bool = True
    document_source: Optional[str] = None


class CandidateMatrixRow(BaseModel):
    model_config = {"extra": "allow"}

    mesh_id: str
    semantic_score: float = 0.0
    geometry_score: float = 0.0
    spatial_score: float = 0.0
    graph_score: float = 0.0
    llm_score: float = 0.0
    final_confidence: float = 0.0
    rejection_reason: Optional[str] = None
    reasoning_points: List[str] = Field(default_factory=list)


CandidateScore = CandidateMatrixRow


class CandidateMatch(BaseModel):
    mesh_id: str
    score: float
    rank: int
    breakdown: Dict[str, float] = Field(default_factory=dict)
    rejection_reason: Optional[str] = None


class StepMappingResult(BaseModel):
    step: int
    instruction: str
    mesh: str
    semantic_name: Optional[str] = None
    confidence: float
    reason: List[str] = Field(default_factory=list)
    top_candidates: List[CandidateMatrixRow] = Field(default_factory=list)
    timeline: List[TimelineStep] = Field(default_factory=list)
    evidence: List[EvidenceItem] = Field(default_factory=list)


MappingResult = StepMappingResult


class ExplainabilityResponse(BaseModel):
    step: int
    instruction: str
    matched_mesh: str
    semantic_name: str
    confidence: float
    reasoning_timeline: List[TimelineStep]
    evidence_chain: List[EvidenceItem]
    top_candidates: List[CandidateMatrixRow]
    rejected_candidates: List[CandidateMatrixRow]


class VisualDebuggerReport(BaseModel):
    timestamp_ms: int = 0
    total_meshes: int = 0
    mapped_count: int = 0
    mesh_details: List[Dict[str, Any]] = Field(default_factory=list)
