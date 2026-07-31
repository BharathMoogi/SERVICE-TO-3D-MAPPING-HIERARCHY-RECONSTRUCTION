"""
Performance Analytics Utility for AtlasAI
Tracks execution timing metrics across pipeline stages and generates benchmark.json.
"""

import time
import json
import logging
from pathlib import Path
from typing import Dict, Any

logger = logging.getLogger("AtlasAI.Benchmark")

class BenchmarkTracker:
    """Tracks latency metrics for CAD loading, vector embeddings, candidate search, LLM reasoning, and ranking."""

    def __init__(self):
        self.metrics: Dict[str, float] = {
            "glb_loading_time_ms": 0.0,
            "mesh_intelligence_time_ms": 0.0,
            "embedding_indexing_time_ms": 0.0,
            "candidate_search_time_ms": 0.0,
            "llm_reasoning_time_ms": 0.0,
            "ranking_time_ms": 0.0,
            "total_execution_time_ms": 0.0,
        }
        self._start_time: float = 0.0

    def start_total(self):
        self._start_time = time.perf_counter()

    def stop_total(self):
        if self._start_time > 0:
            self.metrics["total_execution_time_ms"] = round((time.perf_counter() - self._start_time) * 1000.0, 2)

    def record_stage(self, stage_key: str, elapsed_ms: float):
        if stage_key in self.metrics:
            self.metrics[stage_key] = round(self.metrics[stage_key] + elapsed_ms, 2)
        else:
            self.metrics[stage_key] = round(elapsed_ms, 2)

    def export_benchmark_json(self, output_path: str | Path) -> Path:
        path = Path(output_path)
        path.parent.mkdir(parents=True, exist_ok=True)

        benchmark_data = {
            "system": "AtlasAI Intelligent Service-to-3D Mapping Engine",
            "performance_metrics": self.metrics,
            "timestamp_ms": int(time.time() * 1000)
        }

        with open(path, "w", encoding="utf-8") as f:
            json.dump(benchmark_data, f, indent=2)

        logger.info(f"Exported benchmark.json: {path}")
        return path

class StageTimer:
    """Context manager for timing pipeline stages."""

    def __init__(self, tracker: BenchmarkTracker, stage_key: str):
        self.tracker = tracker
        self.stage_key = stage_key
        self.start = 0.0

    def __enter__(self):
        self.start = time.perf_counter()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        elapsed = (time.perf_counter() - self.start) * 1000.0
        self.tracker.record_stage(self.stage_key, elapsed)
