"""
CLI Interface for AtlasAI Engine
Provides command line operations using Click and Rich terminal formatting.
"""

import sys
import logging
from pathlib import Path

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import click
from rich.console import Console
from rich.table import Table
from rich.panel import Panel

from atlasai.pipeline import AtlasPipeline
from atlasai.config.settings import get_settings

console = Console()

def setup_logging(verbose: bool):
    level = logging.DEBUG if verbose else logging.INFO
    logging.basicConfig(
        level=level,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        handlers=[logging.StreamHandler(sys.stdout)]
    )

@click.group()
def main():
    """AtlasAI - Intelligent Service-to-3D Mapping Engine CLI."""
    pass

@main.command()
@click.option("--glb", required=True, type=click.Path(exists=True), help="Path to input GLB 3D model file.")
@click.option("--steps", required=True, type=click.Path(exists=True), help="Path to input steps.json file.")
@click.option("--out-dir", default="output", type=click.Path(), help="Output directory for results.")
@click.option("--verbose", is_flag=True, help="Enable verbose debug logging.")
def run(glb: str, steps: str, out_dir: str, verbose: bool):
    """Executes full AtlasAI engine pipeline over GLB and maintenance instructions."""
    setup_logging(verbose)
    console.print(Panel.fit("[bold green]AtlasAI Intelligent Service-to-3D Mapping Engine[/bold green]", subtitle="Metadome.ai Hackathon Solution"))

    pipeline = AtlasPipeline()
    results = pipeline.run(glb_path=glb, steps_path=steps, output_dir=out_dir)

    table = Table(title="Execution Summary - Instruction to 3D Mesh Mappings")
    table.add_column("Step #", justify="center", style="cyan")
    table.add_column("Instruction", style="magenta")
    table.add_column("Matched Mesh ID", style="bold green")
    table.add_column("Confidence", justify="right", style="yellow")
    table.add_column("Primary Reason", style="dim")

    for r in results:
        table.add_row(
            str(r.step),
            r.instruction,
            r.mesh,
            f"{r.confidence * 100:.1f}%",
            r.reason[0] if r.reason else ""
        )

    console.print(table)
    console.print(f"\n[bold green]Success![/bold green] Output written to directory: [bold]{out_dir}[/bold]")

@main.command()
@click.option("--out-dir", default="sample_data", type=click.Path(), help="Directory to generate sample files.")
def generate_sample_data(out_dir: str):
    """Generates synthetic 250-mesh microscope.glb and maintenance steps.json for testing."""
    from scripts.generate_sample_data import generate_benchmark_dataset
    out_path = Path(out_dir)
    glb_file, steps_file = generate_benchmark_dataset(out_path)
    console.print(f"[bold green]Generated benchmark dataset:[/bold green]")
    console.print(f" -> 3D Model: {glb_file}")
    console.print(f" -> Steps JSON: {steps_file}")

if __name__ == "__main__":
    main()
