"""
CIVION — Configuration Loader
Reads settings.yaml and exposes a Settings dataclass to the rest of the app.
"""

from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path

import yaml


# ── Nested config sections ───────────────────────────────────

@dataclass
class ServerSettings:
    host: str = "0.0.0.0"
    port: int = 8000


@dataclass
class LLMSettings:
    provider: str = "ollama"
    model: str = "llama3"
    ollama_url: str = "http://localhost:11434"
    openai_api_key: str = ""
    gemini_api_key: str = ""


@dataclass
class AgentSettings:
    default_interval: int = 3600
    auto_start: bool = True


@dataclass
class DatabaseSettings:
    path: str = "data/civion.db"


# ── Top-level settings ───────────────────────────────────────

@dataclass
class Settings:
    server: ServerSettings = field(default_factory=ServerSettings)
    llm: LLMSettings = field(default_factory=LLMSettings)
    agents: AgentSettings = field(default_factory=AgentSettings)
    database: DatabaseSettings = field(default_factory=DatabaseSettings)


# ── Loader ────────────────────────────────────────────────────

_CONFIG_SEARCH_PATHS = [
    Path(__file__).parent / "settings.yaml",
    Path.cwd() / "settings.yaml",
    Path.cwd() / "config" / "settings.yaml",
]


def _deep_merge(base: dict, override: dict) -> dict:
    """Recursively merge *override* into *base*."""
    for key, value in override.items():
        if isinstance(value, dict) and isinstance(base.get(key), dict):
            _deep_merge(base[key], value)
        else:
            base[key] = value
    return base


def load_settings(config_path: str | Path | None = None) -> Settings:
    """Load settings from a YAML file.

    Resolution order:
    1. Explicit *config_path* argument
    2. ``CIVION_CONFIG`` environment variable
    3. Built-in search paths (package dir → cwd)
    """
    raw: dict = {}

    if config_path:
        path = Path(config_path)
    elif env := os.environ.get("CIVION_CONFIG"):
        path = Path(env)
    else:
        path = None
        for candidate in _CONFIG_SEARCH_PATHS:
            if candidate.exists():
                path = candidate
                break

    if path and path.exists():
        with open(path, "r") as fh:
            raw = yaml.safe_load(fh) or {}

    return Settings(
        server=ServerSettings(**raw.get("server", {})),
        llm=LLMSettings(**raw.get("llm", {})),
        agents=AgentSettings(**raw.get("agents", {})),
        database=DatabaseSettings(**raw.get("database", {})),
    )


# Singleton — import and use anywhere
settings = load_settings()
