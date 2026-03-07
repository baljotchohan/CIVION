"""
CIVION Core Configuration
Loads settings from .env file with sensible defaults.
"""
from __future__ import annotations
import os
from pathlib import Path
from typing import Optional
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # ── App ──────────────────────────────────────────
    app_name: str = "CIVION"
    app_version: str = "2.0.0"
    debug: bool = Field(default=True, alias="CIVION_DEBUG")

    # ── Server ───────────────────────────────────────
    host: str = Field(default="0.0.0.0", alias="CIVION_HOST")
    port: int = Field(default=8000, alias="CIVION_PORT")
    frontend_url: str = Field(default="http://localhost:3000", alias="FRONTEND_URL")

    # ── LLM Providers ────────────────────────────────
    llm_provider: str = Field(default="mock", alias="LLM_PROVIDER")
    openai_api_key: Optional[str] = Field(default=None, alias="OPENAI_API_KEY")
    anthropic_api_key: Optional[str] = Field(default=None, alias="ANTHROPIC_API_KEY")
    google_api_key: Optional[str] = Field(default=None, alias="GOOGLE_API_KEY")

    # ── External APIs ────────────────────────────────
    github_token: Optional[str] = Field(default=None, alias="GITHUB_TOKEN")
    news_api_key: Optional[str] = Field(default=None, alias="NEWS_API_KEY")
    coingecko_api_key: Optional[str] = Field(default=None, alias="COINGECKO_API_KEY")

    # ── Database ─────────────────────────────────────
    database_url: str = Field(
        default="sqlite+aiosqlite:///./civion.db", alias="DATABASE_URL"
    )

    # ── Autonomous Mode ──────────────────────────────
    autonomous_enabled: bool = Field(default=False, alias="AUTONOMOUS_ENABLED")
    autonomous_interval_minutes: int = Field(
        default=30, alias="AUTONOMOUS_INTERVAL_MINUTES"
    )

    # ── Network ──────────────────────────────────────
    network_enabled: bool = Field(default=False, alias="NETWORK_ENABLED")
    network_name: str = Field(default="civion-global", alias="NETWORK_NAME")

    # ── Paths ────────────────────────────────────────
    @property
    def data_dir(self) -> Path:
        d = Path.home() / ".civion"
        d.mkdir(parents=True, exist_ok=True)
        return d

    @property
    def db_path(self) -> Path:
        return self.data_dir / "civion.db"

    @property
    def logs_dir(self) -> Path:
        d = self.data_dir / "logs"
        d.mkdir(parents=True, exist_ok=True)
        return d

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "extra": "ignore",
    }


# Singleton
settings = Settings()
