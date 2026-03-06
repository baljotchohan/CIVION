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
    debug: bool = False


@dataclass
class LLMSettings:
    provider: str = "ollama"
    model: str = "llama3"
    ollama_url: str = "http://localhost:11434"
    openai_api_key: str = ""
    gemini_api_key: str = ""
    temperature: float = 0.7
    max_tokens: int = 2048


@dataclass
class AgentSettings:
    default_interval: int = 3600
    auto_start: bool = True
    max_concurrent: int = 5


@dataclass
class DatabaseSettings:
    path: str = "data/civion.db"


@dataclass
class DataSettings:
    path: str = "data"


# ── Top-level settings ───────────────────────────────────────

@dataclass
class Settings:
    server: ServerSettings = field(default_factory=ServerSettings)
    llm: LLMSettings = field(default_factory=LLMSettings)
    agents: AgentSettings = field(default_factory=AgentSettings)
    database: DatabaseSettings = field(default_factory=DatabaseSettings)
    data: DataSettings = field(default_factory=DataSettings)


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
        data=DataSettings(**raw.get("data", {})),
    )


# Singleton — import and use anywhere
settings = load_settings()


def validate_settings() -> tuple[bool, list[str]]:
    """
    Validate all settings at startup.
    
    Returns:
        (is_valid, error_messages)
    """
    errors = []
    
    # Check LLM provider configuration
    if not settings.llm.provider:
        errors.append(
            "LLM provider not configured. "
            "Set 'provider' in civion/config/settings.yaml to: ollama, openai, or gemini"
        )
    
    if settings.llm.provider and settings.llm.provider not in ["ollama", "openai", "gemini"]:
        errors.append(
            f"Invalid LLM provider: {settings.llm.provider}. "
            f"Must be one of: ollama, openai, gemini"
        )
    
    # Check server settings
    if settings.server.port < 1024 or settings.server.port > 65535:
        errors.append(
            f"Invalid server port: {settings.server.port}. "
            f"Must be between 1024 and 65535"
        )
    
    if not settings.server.host:
        errors.append("Server host not configured")
    
    # Check agent settings
    if settings.agents.auto_start is None:
        errors.append("agents.auto_start not configured")
    
    return (len(errors) == 0, errors)
