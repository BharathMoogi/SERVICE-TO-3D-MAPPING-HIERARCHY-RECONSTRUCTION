"""
Generates the complete multi-source engineering package for AtlasAI:
1. microscope.glb (3D CAD model with 250 unlabelled meshes)
2. steps.json (6 maintenance service instructions)
3. service_manual.md (Comprehensive engineering service manual)
4. parts_xref.csv (Part cross-reference mapping catalog)
5. work_orders.json (Historical & open maintenance work orders)
6. inspection_logs.json (Component health & wear inspection logs)
7. service_bulletins.json (Field service bulletins & safety notices)
"""

import json
import csv
import trimesh
import numpy as np
from pathlib import Path


def generate_benchmark_dataset(output_dir: Path):
    output_dir.mkdir(parents=True, exist_ok=True)

    # 1. Generate steps.json
    steps = [
        {"step": 1, "instruction": "Slide out the electronics drawer"},
        {"step": 2, "instruction": "Remove the bottom circuit board"},
        {"step": 3, "instruction": "Detach the sample clips"},
        {"step": 4, "instruction": "Remove mounting nuts"},
        {"step": 5, "instruction": "Disconnect objective lens barrel"},
        {"step": 6, "instruction": "Unbolt motor housing bracket"}
    ]
    steps_path = output_dir / "steps.json"
    with open(steps_path, "w", encoding="utf-8") as f:
        json.dump(steps, f, indent=2)

    # 2. Generate 3D Microscope CAD Model with 250 unlabelled meshes
    scene = trimesh.Scene()
    
    # Core Structural Assemblies
    base_plate = trimesh.creation.box(extents=[1.5, 0.2, 1.2])
    base_plate.apply_translation([0, 0.1, 0])
    scene.add_geometry(base_plate, node_name="Mesh_001")

    vertical_column = trimesh.creation.cylinder(radius=0.1, height=1.5)
    vertical_column.apply_translation([-0.4, 0.95, 0])
    scene.add_geometry(vertical_column, node_name="Mesh_002")

    electronics_drawer = trimesh.creation.box(extents=[1.0, 0.15, 0.8])
    electronics_drawer.apply_translation([0, 0.25, 0])
    scene.add_geometry(electronics_drawer, node_name="Mesh_032")

    circuit_board = trimesh.creation.box(extents=[0.8, 0.02, 0.6])
    circuit_board.apply_translation([0, 0.28, 0])
    scene.add_geometry(circuit_board, node_name="Mesh_143")

    pcb_subassembly = trimesh.creation.box(extents=[1.5, 0.2, 1.2])
    pcb_subassembly.apply_translation([0, 0.1, 0])
    scene.add_geometry(pcb_subassembly, node_name="Mesh_231")

    drawer_bracket = trimesh.creation.box(extents=[0.3, 0.08, 0.3])
    drawer_bracket.apply_translation([0.13, 0.4, 0.04])
    scene.add_geometry(drawer_bracket, node_name="Mesh_241")

    sample_stage = trimesh.creation.box(extents=[0.6, 0.05, 0.6])
    sample_stage.apply_translation([0, 0.8, 0])
    scene.add_geometry(sample_stage, node_name="Mesh_050")

    sample_clip_l = trimesh.creation.box(extents=[0.15, 0.01, 0.03])
    sample_clip_l.apply_translation([-0.47, 1.16, 0.14])
    scene.add_geometry(sample_clip_l, node_name="Mesh_004")

    sample_clip_r = trimesh.creation.box(extents=[0.15, 0.01, 0.03])
    sample_clip_r.apply_translation([-0.1, 0.83, 0.1])
    scene.add_geometry(sample_clip_r, node_name="Mesh_088")

    objective_lens = trimesh.creation.cylinder(radius=0.03, height=0.11)
    objective_lens.apply_translation([-0.35, 1.01, 0.29])
    scene.add_geometry(objective_lens, node_name="Mesh_089")

    mounting_nut = trimesh.creation.cylinder(radius=0.04, height=0.04, sections=6)
    mounting_nut.apply_translation([0.25, 1.2, -0.3])
    scene.add_geometry(mounting_nut, node_name="Mesh_112")

    motor_bracket = trimesh.creation.box(extents=[0.25, 0.25, 0.25])
    motor_bracket.apply_translation([0.42, 0.7, -0.37])
    scene.add_geometry(motor_bracket, node_name="Mesh_098")

    # Generate additional 238 CAD filler components
    np.random.seed(42)
    for i in range(1, 239):
        mesh_id = f"Mesh_{i+12:03d}"
        if mesh_id in scene.geometry:
            continue
        rx = np.random.uniform(-0.6, 0.6)
        ry = np.random.uniform(0.1, 1.6)
        rz = np.random.uniform(-0.5, 0.5)

        geo = trimesh.creation.box(extents=[0.04, 0.04, 0.04])
        geo.apply_translation([rx, ry, rz])
        scene.add_geometry(geo, node_name=mesh_id)

    glb_path = output_dir / "microscope.glb"
    scene.export(str(glb_path), file_type="glb")

    # 3. Generate service_manual.md
    manual_content = """# Metadome AI High-Precision Optical Microscope - Engineering Service Manual
Document ID: ESM-2026-OPT-99
Revision: 4.2 | Classification: Enterprise Maintenance

## Section 1: Electronics & Power Distribution System
### 1.1 Electronics Drawer Subassembly
The electronics drawer (Mesh_032 / Part # EL-DRW-900) houses the primary power regulation and signal processing hardware.
- **Torque Spec**: 2.5 Nm for drawer guide rails.
- **Warning**: Ensure main AC power is disconnected before sliding out the electronics drawer to prevent high-voltage shock.

### 1.2 Main System Circuit Board (PCB)
The bottom circuit board (Mesh_231 / Part # PCB-MAIN-880 / Mesh_143) contains the main FPGA controller and motor drivers.
- **Procedure**: Remove 4 corner mounting screws before detaching the circuit board.
- **Torque Spec**: 1.2 Nm for PCB standoff screws.
- **Warning**: Wear anti-static ESD wrist strap during handling.

## Section 2: Sample Stage & Clip Assembly
### 2.1 Sample Clips
The dual sample clips (Mesh_004, Mesh_088 / Part # CLP-SMP-104) secure glass specimen slides to the motorized XY stage (Mesh_050).
- **Procedure**: Pinch tension spring to detach clip arms from stage mounting pins.

### 2.2 Mounting Nuts & Hardware
Mounting nuts (Mesh_112 / Part # NUT-M6-SS) secure the vertical column and stage bracket.
- **Torque Spec**: 6.0 Nm for M6 stainless steel mounting nuts.

## Section 3: Optical Revolver & Lens System
### 3.1 Objective Lens Barrel
The objective lens barrel (Mesh_089 / Part # LNS-OBJ-40X) mounts to the rotating nosepiece turret.
- **Warning**: Do not touch optical glass surfaces. Use lens paper only.

## Section 4: Motor & Drive Subsystem
### 4.1 Motor Housing Bracket
The motor housing bracket (Mesh_098 / Part # BRK-MTR-770) attaches the Z-focus stepper motor to the cast frame.
- **Torque Spec**: 4.0 Nm for bracket mounting hex bolts.
"""
    manual_path = output_dir / "service_manual.md"
    with open(manual_path, "w", encoding="utf-8") as f:
        f.write(manual_content)

    # 4. Generate parts_xref.csv
    parts_data = [
        ["Component_Name", "Part_Number", "Mesh_ID", "Assembly_Name", "Manual_Page", "Manual_Section", "Work_Order_ID"],
        ["Electronics Drawer", "EL-DRW-900", "Mesh_032", "Bottom Assembly", "3", "Section 1.1", "WO-7741"],
        ["Drawer Bracket", "BRK-DRW-241", "Mesh_241", "Bottom Assembly", "3", "Section 1.1", "WO-7741"],
        ["Main Circuit Board", "PCB-MAIN-880", "Mesh_231", "Bottom Assembly", "4", "Section 1.2", "WO-8820"],
        ["Sub Circuit Board", "PCB-SUB-143", "Mesh_143", "Bottom Assembly", "4", "Section 1.2", "WO-8820"],
        ["Sample Stage", "STG-XY-050", "Mesh_050", "Middle Assembly", "6", "Section 2.1", "WO-9012"],
        ["Left Sample Clip", "CLP-SMP-104", "Mesh_004", "Middle Assembly", "6", "Section 2.1", "WO-9012"],
        ["Right Sample Clip", "CLP-SMP-105", "Mesh_088", "Middle Assembly", "6", "Section 2.1", "WO-9012"],
        ["Mounting Nut M6", "NUT-M6-SS", "Mesh_112", "Middle Assembly", "8", "Section 2.2", "WO-9104"],
        ["Objective Lens 40X", "LNS-OBJ-40X", "Mesh_089", "Optical Nosepiece", "11", "Section 3.1", "WO-9350"],
        ["Motor Bracket", "BRK-MTR-770", "Mesh_098", "Motor Drive", "14", "Section 4.1", "WO-9510"]
    ]
    parts_path = output_dir / "parts_xref.csv"
    with open(parts_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerows(parts_data)

    # 5. Generate work_orders.json
    work_orders = [
        {
            "work_order_id": "WO-7741",
            "component_name": "Electronics Drawer",
            "mesh_id": "Mesh_032",
            "issue_description": "Drawer guide rail binding reported during annual maintenance.",
            "status": "Closed",
            "technician": "Sarah Jenkins",
            "replacement_part": "EL-DRW-900",
            "service_date": "2026-03-15"
        },
        {
            "work_order_id": "WO-8820",
            "component_name": "Main Circuit Board",
            "mesh_id": "Mesh_231",
            "issue_description": "FPGA power rail voltage fluctuation causing intermittent motor reset.",
            "status": "Open",
            "technician": "Alex Rivera",
            "replacement_part": "PCB-MAIN-880",
            "service_date": "2026-07-20"
        },
        {
            "work_order_id": "WO-9012",
            "component_name": "Sample Clips",
            "mesh_id": "Mesh_004",
            "issue_description": "Tension spring fatigue on left sample clip.",
            "status": "Closed",
            "technician": "Michael Chen",
            "replacement_part": "CLP-SMP-104",
            "service_date": "2026-05-10"
        }
    ]
    wo_path = output_dir / "work_orders.json"
    with open(wo_path, "w", encoding="utf-8") as f:
        json.dump(work_orders, f, indent=2)

    # 6. Generate inspection_logs.json
    inspection_logs = [
        {
            "log_id": "INSP-2026-01",
            "mesh_id": "Mesh_231",
            "part_number": "PCB-MAIN-880",
            "inspection_date": "2026-07-15",
            "health_score": 0.82,
            "findings": "Minor thermal discoloration on Q3 power MOSFET. Recommended replacement.",
            "status": "Warning"
        },
        {
            "log_id": "INSP-2026-02",
            "mesh_id": "Mesh_112",
            "part_number": "NUT-M6-SS",
            "inspection_date": "2026-06-01",
            "health_score": 0.98,
            "findings": "Torque verified at 6.0 Nm. Zero corrosion detected.",
            "status": "Pass"
        }
    ]
    insp_path = output_dir / "inspection_logs.json"
    with open(insp_path, "w", encoding="utf-8") as f:
        json.dump(inspection_logs, f, indent=2)

    # 7. Generate service_bulletins.json
    bulletins = [
        {
            "bulletin_id": "SB-2026-04",
            "title": "Circuit Board Standoff Insulator Upgrade",
            "affected_parts": ["PCB-MAIN-880", "Mesh_231", "Mesh_143"],
            "severity": "High",
            "summary": "Mandatory installation of nylon insulating washers under PCB mounting screws to prevent ground loop interference.",
            "release_date": "2026-04-10"
        },
        {
            "bulletin_id": "SB-2026-09",
            "title": "Objective Lens Retaining Ring Inspection",
            "affected_parts": ["LNS-OBJ-40X", "Mesh_089"],
            "severity": "Medium",
            "summary": "Verify optical turret alignment ring torque during routine optical recalibration.",
            "release_date": "2026-06-18"
        }
    ]
    sb_path = output_dir / "service_bulletins.json"
    with open(sb_path, "w", encoding="utf-8") as f:
        json.dump(bulletins, f, indent=2)

    print(f"Successfully generated multi-source engineering package in '{output_dir}'.")
    return glb_path, steps_path


if __name__ == "__main__":
    import sys
    base_dir = Path(__file__).resolve().parent.parent / "sample_data"
    generate_benchmark_dataset(base_dir)
