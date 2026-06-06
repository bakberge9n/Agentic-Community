"""Application configuration via environment variables."""

import os
from pydantic_settings import BaseSettings
from typing import List


def parse_origins(value: str | None) -> List[str]:
    """Parse comma-separated origins from env var."""
    if not value:
        return ["http://localhost:5173", "http://localhost:4173"]
    return [origin.strip() for origin in value.split(",") if origin.strip()]


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    host: str = "0.0.0.0"
    port: int = 8000
    debug: bool = True

    # CORS
    allowed_origins: List[str] = []

    # Qdrant
    qdrant_url: str = "http://localhost:6333"
    qdrant_api_key: str = ""

    # Agent defaults
    default_agent_token_budget: int = 500_000
    max_memory_items_per_tier: int = 50

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if not self.allowed_origins:
            self.allowed_origins = parse_origins(os.getenv("ALLOWED_ORIGINS"))

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()