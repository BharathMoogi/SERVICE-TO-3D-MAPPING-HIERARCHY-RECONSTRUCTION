# AtlasAI - Intelligent Service-to-3D Mapping Engine Report
*Generated on 2026-07-31 12:38:14 | Metadome.ai Service-to-3D Hackathon*

## Executive Summary
AtlasAI successfully loaded and analyzed **241 generic 3D mesh nodes** from the digital twin model 
and mapped **6 engineering maintenance instructions** to exact sub-assemblies using multi-modal AI reasoning.

| Step # | Instruction | Matched 3D Mesh | Confidence | Primary Rationale |
| --- | --- | --- | --- | --- |
| `1` | Slide out the electronics drawer | **Mesh_060** | `69.0%` | Located inside bottom assembly at (0.12, -0.04, 0.21) |
| `2` | Remove the bottom circuit board | **Mesh_231** | `74.8%` | Located inside bottom assembly at (0.00, 0.00, 0.10) |
| `3` | Detach the sample clips | **Mesh_004** | `79.0%` | Located inside middle assembly at (-0.47, 0.14, 1.16) |
| `4` | Remove mounting nuts | **Mesh_112** | `75.8%` | Located inside middle assembly at (0.25, -0.30, 1.20) |
| `5` | Disconnect objective lens barrel | **Mesh_089** | `69.0%` | Located inside middle assembly at (-0.35, 0.29, 1.01) |
| `6` | Unbolt motor housing bracket | **Mesh_018** | `60.7%` | Located inside middle assembly at (0.22, 0.15, 0.51) |

---

## Detailed Step-by-Step Decision Rationale

### Step 1: "Slide out the electronics drawer"
- **Final Selection**: `Mesh_060`
- **Overall Confidence Score**: `0.6899`

#### Reasoning Evidence Chain:
  - Located inside bottom assembly at (0.12, -0.04, 0.21)
  - Classified as 'bracket component' with volume 0.000006 m^3
  - Dense vector similarity score of 0.75 for 'electronics drawer'
  - Gemini LLM reasoning confidence evaluated at 61%

#### Top Candidate Rankings & Rejection Rationale:
| Candidate Mesh | Vector Score | Geometry Score | Spatial Score | LLM Score | Final Confidence | Status | Rationale |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `Mesh_060` | `0.75` | `0.17` | `0.60` | `0.61` | `0.6899` | ✅ **SELECTED** | Top score alignment |
| `Mesh_005` | `0.75` | `0.17` | `0.60` | `0.61` | `0.6891` | ❌ Rejected | Geometry matches expected 'bracket_component' profile. |
| `Mesh_062` | `0.75` | `0.17` | `0.60` | `0.61` | `0.6890` | ❌ Rejected | Geometry matches expected 'bracket_component' profile. |
| `Mesh_076` | `0.75` | `0.17` | `0.60` | `0.61` | `0.6890` | ❌ Rejected | Geometry matches expected 'bracket_component' profile. |
| `Mesh_063` | `0.74` | `0.17` | `0.60` | `0.61` | `0.6876` | ❌ Rejected | Geometry matches expected 'bracket_component' profile. |

### Step 2: "Remove the bottom circuit board"
- **Final Selection**: `Mesh_231`
- **Overall Confidence Score**: `0.7475`

#### Reasoning Evidence Chain:
  - Located inside bottom assembly at (0.00, 0.00, 0.10)
  - Classified as 'large flat plate' with volume 0.360000 m^3
  - Dense vector similarity score of 0.83 for 'bottom circuit board'
  - Gemini LLM reasoning confidence evaluated at 81%

#### Top Candidate Rankings & Rejection Rationale:
| Candidate Mesh | Vector Score | Geometry Score | Spatial Score | LLM Score | Final Confidence | Status | Rationale |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `Mesh_231` | `0.83` | `0.50` | `0.87` | `0.81` | `0.7475` | ✅ **SELECTED** | Top score alignment |
| `Mesh_196` | `0.62` | `0.50` | `0.86` | `0.72` | `0.6798` | ❌ Rejected | Geometry matches expected 'thin_plate' profile. |
| `Mesh_229` | `0.62` | `0.50` | `0.84` | `0.72` | `0.6749` | ❌ Rejected | Geometry matches expected 'thin_plate' profile. |
| `Mesh_138` | `0.61` | `0.50` | `0.83` | `0.71` | `0.6694` | ❌ Rejected | Geometry matches expected 'thin_plate' profile. |
| `Mesh_144` | `0.62` | `0.50` | `0.71` | `0.69` | `0.6457` | ❌ Rejected | Geometry matches expected 'thin_plate' profile. |

### Step 3: "Detach the sample clips"
- **Final Selection**: `Mesh_004`
- **Overall Confidence Score**: `0.7899`

#### Reasoning Evidence Chain:
  - Located inside middle assembly at (-0.47, 0.14, 1.16)
  - Classified as 'thin plate' with volume 0.000060 m^3
  - Dense vector similarity score of 0.75 for 'sample clips'
  - Gemini LLM reasoning confidence evaluated at 70%

#### Top Candidate Rankings & Rejection Rationale:
| Candidate Mesh | Vector Score | Geometry Score | Spatial Score | LLM Score | Final Confidence | Status | Rationale |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `Mesh_004` | `0.75` | `0.43` | `0.60` | `0.70` | `0.7899` | ✅ **SELECTED** | Top score alignment |
| `Mesh_087` | `0.75` | `0.43` | `0.60` | `0.69` | `0.7890` | ❌ Rejected | Geometry matches expected 'thin_plate' profile. |
| `Mesh_021` | `0.75` | `0.43` | `0.60` | `0.69` | `0.7888` | ❌ Rejected | Geometry matches expected 'thin_plate' profile. |
| `Mesh_012` | `0.75` | `0.43` | `0.60` | `0.69` | `0.7871` | ❌ Rejected | Geometry matches expected 'thin_plate' profile. |
| `Mesh_020` | `0.74` | `0.43` | `0.60` | `0.69` | `0.7851` | ❌ Rejected | Geometry matches expected 'thin_plate' profile. |

### Step 4: "Remove mounting nuts"
- **Final Selection**: `Mesh_112`
- **Overall Confidence Score**: `0.7585`

#### Reasoning Evidence Chain:
  - Located inside middle assembly at (0.25, -0.30, 1.20)
  - Classified as 'fastener nut' with volume 0.000389 m^3
  - Dense vector similarity score of 0.86 for 'mounting nuts'
  - Gemini LLM reasoning confidence evaluated at 83%

#### Top Candidate Rankings & Rejection Rationale:
| Candidate Mesh | Vector Score | Geometry Score | Spatial Score | LLM Score | Final Confidence | Status | Rationale |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `Mesh_112` | `0.86` | `0.71` | `0.60` | `0.83` | `0.7585` | ✅ **SELECTED** | Top score alignment |
| `Mesh_131` | `0.86` | `0.71` | `0.60` | `0.83` | `0.7583` | ❌ Rejected | Geometry matches expected 'fastener_nut' profile. |
| `Mesh_207` | `0.86` | `0.71` | `0.60` | `0.83` | `0.7581` | ❌ Rejected | Geometry matches expected 'fastener_nut' profile. |
| `Mesh_090` | `0.86` | `0.71` | `0.60` | `0.83` | `0.7580` | ❌ Rejected | Geometry matches expected 'fastener_nut' profile. |
| `Mesh_009` | `0.86` | `0.71` | `0.60` | `0.83` | `0.7571` | ❌ Rejected | Geometry matches expected 'fastener_nut' profile. |

### Step 5: "Disconnect objective lens barrel"
- **Final Selection**: `Mesh_089`
- **Overall Confidence Score**: `0.6897`

#### Reasoning Evidence Chain:
  - Located inside middle assembly at (-0.35, 0.29, 1.01)
  - Classified as 'cylinder rod' with volume 0.000074 m^3
  - Dense vector similarity score of 0.72 for 'objective lens barrel'
  - Gemini LLM reasoning confidence evaluated at 61%

#### Top Candidate Rankings & Rejection Rationale:
| Candidate Mesh | Vector Score | Geometry Score | Spatial Score | LLM Score | Final Confidence | Status | Rationale |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `Mesh_089` | `0.72` | `0.20` | `0.60` | `0.61` | `0.6897` | ✅ **SELECTED** | Top score alignment |
| `Mesh_119` | `0.72` | `0.20` | `0.60` | `0.61` | `0.6891` | ❌ Rejected | Geometry matches expected 'cylinder_rod' profile. |
| `Mesh_211` | `0.72` | `0.20` | `0.60` | `0.61` | `0.6890` | ❌ Rejected | Geometry matches expected 'cylinder_rod' profile. |
| `Mesh_162` | `0.72` | `0.20` | `0.60` | `0.61` | `0.6886` | ❌ Rejected | Geometry matches expected 'cylinder_rod' profile. |
| `Mesh_158` | `0.72` | `0.20` | `0.60` | `0.61` | `0.6884` | ❌ Rejected | Geometry matches expected 'cylinder_rod' profile. |

### Step 6: "Unbolt motor housing bracket"
- **Final Selection**: `Mesh_018`
- **Overall Confidence Score**: `0.6073`

#### Reasoning Evidence Chain:
  - Located inside middle assembly at (0.22, 0.15, 0.51)
  - Classified as 'bracket component' with volume 0.000006 m^3
  - Dense vector similarity score of 0.70 for 'motor housing bracket'
  - Gemini LLM reasoning confidence evaluated at 53%

#### Top Candidate Rankings & Rejection Rationale:
| Candidate Mesh | Vector Score | Geometry Score | Spatial Score | LLM Score | Final Confidence | Status | Rationale |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `Mesh_018` | `0.70` | `0.00` | `0.60` | `0.53` | `0.6073` | ✅ **SELECTED** | Top score alignment |
| `Mesh_008` | `0.70` | `0.00` | `0.60` | `0.53` | `0.6064` | ❌ Rejected | Geometry matches expected 'bracket_component' profile. |
| `Mesh_002` | `0.70` | `0.00` | `0.60` | `0.53` | `0.6060` | ❌ Rejected | Geometry matches expected 'bracket_component' profile. |
| `Mesh_023` | `0.70` | `0.00` | `0.60` | `0.53` | `0.6055` | ❌ Rejected | Geometry matches expected 'bracket_component' profile. |
| `Mesh_017` | `0.69` | `0.00` | `0.60` | `0.53` | `0.6008` | ❌ Rejected | Geometry matches expected 'bracket_component' profile. |
