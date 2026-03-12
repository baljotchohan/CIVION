"""
CIVION Core Configuration
Manages system settings and secrets with validation.
"""
import os
import json
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional
from pydantic import Field, field_validator, ConfigDict
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """Application settings with validation."""
    
    model_config = ConfigDict(
        env_file=".env", 
        env_file_encoding="utf-8",
        extra="allow",
        validate_assignment=True
    )
    
    # Storage paths (pre-computed)
    config_dir: Path = Path.home() / ".civion"
    config_file: Path = Path.home() / ".civion" / "config.json"
    secrets_file: Path = Path.home() / ".civion" / ".secrets"
    db_path: Path = Path.home() / ".civion" / "civion.db"
    logs_dir: Path = Path.home() / ".civion" / "logs"
    
    # API Configuration
    api_host: str = Field(default="0.0.0.0", description="API host address")
    api_port: int = Field(
        default=8000,
        ge=1024,
        le=65535,
        description="API port (must be 1024-65535)"
    )
    
    # Compatibility aliases
    @property
    def host(self) -> str: return self.api_host
    @property
    def port(self) -> int: return self.api_port
    
    @property
    def AGENT_TIMEOUT(self) -> int: return self.timeout
    
    @property
    def CLI_TIMEOUT(self) -> int: return 300 # Longer for reasoning
    
    def config_exists(self) -> bool:
        return self.config_file.exists() or self.secrets_file.exists()
    
    # Worker Configuration
    max_workers: int = Field(default=4, ge=1, le=100)
    max_concurrent_agents: int = Field(default=5, ge=1, le=50)
    
    # Timeout Configuration
    timeout: int = Field(default=30, ge=5, le=300)
    
    # LLM Configuration
    llm_provider: str = Field(default="anthropic")
    llm_model: str = Field(default="claude-3-5-sonnet-20240620")
    llm_fallback_providers: List[str] = Field(default_factory=list)
    
    # API Keys
    anthropic_api_key: Optional[str] = Field(default=None)
    openai_api_key: Optional[str] = Field(default=None)
    google_api_key: Optional[str] = Field(default=None)
    github_token: Optional[str] = Field(default=None)
    news_api_key: Optional[str] = Field(default=None)
    coingecko_api_key: Optional[str] = Field(default=None)
    
    # Features
    debug: bool = Field(default=False)
    network_enabled: bool = Field(default=True)
    autonomous_enabled: bool = Field(default=False)
    auto_open_browser: bool = Field(default=True)
    mock_mode: bool = Field(default=False)
    
    # Logging
    log_level: str = Field(default="INFO")
    
    @field_validator('api_port')
    @classmethod
    def validate_port(cls, v: int) -> int:
        if not 1024 <= v <= 65535:
            raise ValueError("Port must be between 1024 and 65535")
        return v
    
    @field_validator('llm_provider')
    @classmethod
    def validate_llm_provider(cls, v: str) -> str:
        valid_providers = [
            "anthropic", "openai", "gemini", "mistral", 
            "azure", "cohere", "bedrock", "huggingface", "together", "now", "mock"
        ]
        if v.lower() not in valid_providers:
            raise ValueError(f"Invalid LLM provider. Must be one of: {', '.join(valid_providers)}")
        return v.lower()
    
    @field_validator('log_level')
    @classmethod
    def validate_log_level(cls, v: str) -> str:
        valid_levels = ["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]
        if v.upper() not in valid_levels:
            raise ValueError(f"Invalid log level. Must be one of: {', '.join(valid_levels)}")
        return v.upper()

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.config_dir.mkdir(parents=True, exist_ok=True)
        self.logs_dir.mkdir(parents=True, exist_ok=True)
        self._load_legacy_config()
        self._load_secrets()

    def _load_legacy_config(self):
        """Compatibility for old config.json"""
        if self.config_file.exists():
            try:
                with open(self.config_file, 'r') as f:
                    data = json.load(f)
                    # Mapping old names to new ones if necessary
                    if "port" in data: data["api_port"] = data.pop("port")
                    if "host" in data: data["api_host"] = data.pop("host")
                    
                    for k, v in data.items():
                        if hasattr(self, k):
                            setattr(self, k, v)
            except Exception as e:
                logging.error(f"Failed to load legacy config: {e}")

    def _load_secrets(self):
        """Load from .secrets file"""
        if self.secrets_file.exists():
            try:
                with open(self.secrets_file, 'r') as f:
                    secrets = json.load(f)
                    for k, v in secrets.items():
                        attr_name = k.lower()
                        if hasattr(self, attr_name):
                            setattr(self, attr_name, v)
            except Exception as e:
                logging.error(f"Failed to load secrets: {e}")

    def save(self):
        """Save settings to config.json"""
        try:
            data = self.model_dump(exclude={"config_dir", "config_file", "secrets_file", "db_path", "logs_dir"})
            # Revert aliases for saving if needed, or just save as is
            with open(self.config_file, 'w') as f:
                json.dump(data, f, indent=2)
        except Exception as e:
            logging.error(f"Failed to save config: {e}")

    def set_secret(self, key: str, value: str):
        """Compatibility method for saving secrets"""
        try:
            secrets = {}
            if self.secrets_file.exists():
                with open(self.secrets_file, 'r') as f:
                    secrets = json.load(f)
            
            secrets[key] = value
            with open(self.secrets_file, 'w') as f:
                json.dump(secrets, f, indent=2)
            os.chmod(self.secrets_file, 0o600)
            
            # Also update current instance
            attr_name = key.lower()
            if hasattr(self, attr_name):
                setattr(self, attr_name, value)
        except Exception as e:
            logging.error(f"Failed to save secret: {e}")

    def get_secret(self, key: str) -> Optional[str]:
        """Compatibility method for getting secrets"""
        attr_name = key.lower()
        if hasattr(self, attr_name):
            return getattr(self, attr_name)
        return os.environ.get(key)

    @property
    def database_url(self) -> str:
        return f"sqlite+aiosqlite:///{self.db_path}"

# Re-instantiate singleton
settings = Settings()
config = settings

def _save_env_file(data: dict):
    """Helper for CLI"""
    for k, v in data.items():
        settings.set_secret(k, v)
