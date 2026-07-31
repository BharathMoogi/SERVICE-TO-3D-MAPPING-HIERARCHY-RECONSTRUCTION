"""
Configuration Settings for AtlasAI Engine
Fully config-driven with environment variable support and zero hardcoded secrets.
"""

from typing import Dict
from pydantic import Field, ConfigDict
from pydantic_settings import BaseSettings

class RankingWeights(BaseSettings):
    semantic: float = Field(default=0.35, description="Weight for vector semantic similarity")
    geometry: float = Field(default=0.25, description="Weight for shape descriptor matching")
    spatial: float = Field(default=0.15, description="Weight for spatial location & bounding box alignment")
    hierarchy: float = Field(default=0.10, description="Weight for structural parent/child graph context")
    llm: float = Field(default=0.15, description="Weight for Gemini / LLM semantic reasoning")

class Settings(BaseSettings):
    model_config = ConfigDict(
        env_prefix="ATLAS_",
        env_file=".env",
        extra="ignore"
    )

    # API Configurations
    gemini_api_key: str = Field(default="", validation_alias="ATLAS_GEMINI_API_KEY")
    gemini_model: str = Field(default="gemini-2.5-flash", validation_alias="ATLAS_GEMINI_MODEL")
    embedding_model_name: str = Field(default="all-MiniLM-L6-v2", validation_alias="ATLAS_EMBEDDING_MODEL")
    
    # Engine Settings
    top_k_candidates: int = Field(default=10, validation_alias="ATLAS_CANDIDATE_TOP_K")
    weights: RankingWeights = Field(default_factory=RankingWeights)
    
    # System settings
    log_level: str = Field(default="INFO")
    enable_gpu_embeddings: bool = Field(default=False)

# Singleton instance access
_settings_instance: Settings | None = None

def get_settings() -> Settings:
    global _settings_instance
    if _settings_instance is None:
        _settings_instance = Settings()
    return _settings_instance
