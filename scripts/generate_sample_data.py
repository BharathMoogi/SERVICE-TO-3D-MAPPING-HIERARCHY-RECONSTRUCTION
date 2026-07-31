"""
Benchmark Dataset Generator Script
Generates sample_data/steps.json and sample_data/microscope.glb containing ~250 unlabelled 3D mesh nodes
representing a industrial microscope CAD assembly.
"""

import json
import logging
from pathlib import Path
from typing import Tuple
import numpy as np
import trimesh

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("AtlasAI.BenchmarkGenerator")

def generate_benchmark_dataset(output_dir: str | Path = "sample_data") -> Tuple[Path, Path]:
    out_path = Path(output_dir)
    out_path.mkdir(parents=True, exist_ok=True)

    steps_file = out_path / "steps.json"
    glb_file = out_path / "microscope.glb"

    # 1. Generate steps.json
    steps_data = [
        {"step": 1, "instruction": "Slide out the electronics drawer"},
        {"step": 2, "instruction": "Remove the bottom circuit board"},
        {"step": 3, "instruction": "Detach the sample clips"},
        {"step": 4, "instruction": "Remove mounting nuts"},
        {"step": 5, "instruction": "Disconnect objective lens barrel"},
        {"step": 6, "instruction": "Unbolt motor housing bracket"}
    ]

    with open(steps_file, "w", encoding="utf-8") as f:
        json.dump(steps_data, f, indent=2)
    logger.info(f"Created benchmark steps.json: {steps_file}")

    # 2. Generate microscope.glb with ~250 unlabelled mesh nodes
    scene = trimesh.Scene()

    # Define key sub-assemblies with distinct geometry & spatial coordinates
    
    # Assembly Base (bottom)
    base_mesh = trimesh.creation.box(extents=[1.5, 1.2, 0.2])
    base_mesh.apply_translation([0.0, 0.0, 0.1])

    # Electronics drawer (bottom, wide flat enclosure)
    drawer_mesh = trimesh.creation.box(extents=[1.0, 0.8, 0.15])
    drawer_mesh.apply_translation([0.0, 0.0, 0.25])

    # Bottom Circuit Board (very flat plate inside/at bottom of drawer)
    pcb_mesh = trimesh.creation.box(extents=[0.8, 0.6, 0.02])
    pcb_mesh.apply_translation([0.0, 0.0, 0.28])

    # Vertical Column Stand (middle assembly)
    column_mesh = trimesh.creation.cylinder(radius=0.1, height=1.5)
    column_mesh.apply_translation([-0.4, 0.0, 0.95])

    # Stage Assembly (middle height)
    stage_mesh = trimesh.creation.box(extents=[0.6, 0.6, 0.05])
    stage_mesh.apply_translation([0.0, 0.0, 0.8])

    # Sample Clips (2 thin plates on top of stage)
    clip1 = trimesh.creation.box(extents=[0.15, 0.03, 0.005])
    clip1.apply_translation([-0.1, 0.1, 0.83])
    
    clip2 = trimesh.creation.box(extents=[0.15, 0.03, 0.005])
    clip2.apply_translation([0.1, 0.1, 0.83])

    # Mounting Nuts (4 small hex fasteners on base)
    nuts = []
    nut_coords = [[-0.6, -0.5, 0.21], [0.6, -0.5, 0.21], [-0.6, 0.5, 0.21], [0.6, 0.5, 0.21]]
    for x, y, z in nut_coords:
        n = trimesh.creation.cylinder(radius=0.03, height=0.02, sections=6)
        n.apply_translation([x, y, z])
        nuts.append(n)

    # Objective Lens (cylinder on upper column)
    lens_mesh = trimesh.creation.cylinder(radius=0.08, height=0.3)
    lens_mesh.apply_translation([0.0, 0.0, 1.2])

    # Motor Housing (compact cube at rear)
    motor_mesh = trimesh.creation.box(extents=[0.25, 0.25, 0.25])
    motor_mesh.apply_translation([-0.4, -0.3, 0.5])

    # Add core key meshes to scene
    key_geometries = [
        ("Mesh_032", drawer_mesh),      # Electronics drawer
        ("Mesh_143", pcb_mesh),         # Bottom circuit board
        ("Mesh_088", clip1),            # Sample clip 1
        ("Mesh_089", clip2),            # Sample clip 2
        ("Mesh_012", nuts[0]),          # Mounting nut
        ("Mesh_013", nuts[1]),
        ("Mesh_014", nuts[2]),
        ("Mesh_015", nuts[3]),
        ("Mesh_176", lens_mesh),        # Objective lens
        ("Mesh_204", motor_mesh),       # Motor housing
        ("Mesh_001", base_mesh),
        ("Mesh_002", column_mesh),
        ("Mesh_050", stage_mesh),
    ]

    for name, geo in key_geometries:
        scene.add_geometry(geo, node_name=name)

    # Generate additional synthetic background structural/fastener meshes to reach ~250 meshes total
    total_needed = 250 - len(key_geometries)
    np.random.seed(42)

    for i in range(total_needed):
        mesh_id = f"Mesh_{len(key_geometries) + i + 1:03d}"
        
        # Randomize geometric shape types
        stype = np.random.choice(["cylinder", "box", "fastener", "plate"])
        
        rx = np.random.uniform(-0.6, 0.6)
        ry = np.random.uniform(-0.5, 0.5)
        rz = np.random.uniform(0.1, 1.6)

        if stype == "cylinder":
            g = trimesh.creation.cylinder(radius=float(np.random.uniform(0.01, 0.05)), height=float(np.random.uniform(0.05, 0.2)))
        elif stype == "plate":
            g = trimesh.creation.box(extents=[float(np.random.uniform(0.05, 0.2)), float(np.random.uniform(0.05, 0.2)), float(np.random.uniform(0.005, 0.02))])
        elif stype == "fastener":
            g = trimesh.creation.cylinder(radius=0.015, height=0.01, sections=6)
        else:
            g = trimesh.creation.box(extents=[float(np.random.uniform(0.02, 0.1)), float(np.random.uniform(0.02, 0.1)), float(np.random.uniform(0.02, 0.1))])

        g.apply_translation([rx, ry, rz])
        scene.add_geometry(g, node_name=mesh_id)

    # Export GLB file
    scene.export(str(glb_file))
    logger.info(f"Successfully exported 3D model with {len(scene.geometry)} unlabelled meshes: {glb_file}")

    return glb_file, steps_file

if __name__ == "__main__":
    generate_benchmark_dataset()
