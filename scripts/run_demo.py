"""
End-to-End Demo Script for AtlasAI
Generates benchmark dataset and executes full AtlasAI Service-to-3D pipeline.
"""

import sys
from pathlib import Path

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from scripts.generate_sample_data import generate_benchmark_dataset
from atlasai.pipeline import AtlasPipeline

def main():
    print("=== Initializing AtlasAI Service-to-3D Mapping Engine Demo ===")
    
    # 1. Generate benchmark dataset
    sample_dir = Path("sample_data")
    glb_file, steps_file = generate_benchmark_dataset(sample_dir)

    # 2. Run Pipeline
    pipeline = AtlasPipeline()
    output_dir = Path("output")
    results = pipeline.run(glb_path=glb_file, steps_path=steps_file, output_dir=output_dir)

    print("\n[MAPPING RESULTS SUMMARY]")
    print("=" * 70)
    for res in results:
        print(f"Step {res.step}: {res.instruction}")
        print(f"  -> Matched Mesh: {res.mesh} (Confidence: {res.confidence * 100:.1f}%)")
        for r in res.reason[:2]:
            print(f"    * {r}")
        print("-" * 70)

    print(f"\n[OUTPUT FILES GENERATED] in '{output_dir.absolute()}':")
    print(f"  * mapping.json")
    print(f"  * mesh_report.json (Visual Debugger)")
    print(f"  * report.md (Explainable Markdown Report)")
    print(f"  * Open web_visualizer/index.html to view interactive 3D Web Visualizer!")

if __name__ == "__main__":
    main()
