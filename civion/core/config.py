"""
CIVION Core Configuration
Manages system settings and secrets stored in ~/.civion/
"""
import os
import json
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional

class CivionConfig:
    """Universal configuration manager for CIVION"""
    
    # Storage paths
    config_dir: Path = Path.home() / ".civion"
    config_file: Path = config_dir / "config.json"
    secrets_file: Path = config_dir / ".secrets"
    db_path: Path = config_dir / "civion.db"
    logs_dir: Path = config_dir / "logs"
    
    def __init__(self):
        # Default settings
        self.llm_provider: str = "anthropic"
        self.llm_model: str = "claude-sonnet-4-5"
        self.llm_fallback_providers: List[str] = []
        
        self.port: int = 8000
        self.host: str = "0.0.0.0"
        self.auto_open_browser: bool = True
        
        self.max_concurrent_agents: int = 5
        self.agent_refresh_interval: int = 60
        
        self.enable_p2p_network: bool = True
        self.mock_mode: bool = False
        self.debug: bool = False
        self.network_enabled: bool = True
        self.autonomous_enabled: bool = False
        self.log_level: str = "INFO"
        
        # Ensure directories exist
        self.config_dir.mkdir(parents=True, exist_ok=True)
        self.logs_dir.mkdir(parents=True, exist_ok=True)
        
        # If config exists, load it
        if self.config_exists():
            self._load_from_file()

    def _load_from_file(self):
        """Load settings from config.json"""
        try:
            if self.config_file.exists():
                with open(self.config_file, 'r') as f:
                    data = json.load(f)
                    for key, value in data.items():
                        if hasattr(self, key):
                            setattr(self, key, value)
        except Exception as e:
            logging.error(f"Failed to load config: {e}")

    def save(self):
        """Save settings to config.json"""
        try:
            self.config_dir.mkdir(parents=True, exist_ok=True)
            with open(self.config_file, 'w') as f:
                json.dump(self.to_dict(), f, indent=2)
        except Exception as e:
            logging.error(f"Failed to save config: {e}")

    @classmethod
    def load(cls) -> "CivionConfig":
        """Factory method to load config"""
        return cls()

    def get_secret(self, key: str) -> Optional[str]:
        """Get secret from .secrets file"""
        try:
            if not self.secrets_file.exists():
                return os.environ.get(key)
            
            with open(self.secrets_file, 'r') as f:
                secrets = json.load(f)
                return secrets.get(key) or os.environ.get(key)
        except Exception as e:
            logging.error(f"Failed to read secrets: {e}")
            return os.environ.get(key)

    def set_secret(self, key: str, value: str):
        """Save secret to .secrets file with restricted permissions"""
        try:
            secrets = {}
            if self.secrets_file.exists():
                with open(self.secrets_file, 'r') as f:
                    secrets = json.load(f)
            
            secrets[key] = value
            
            # Write with restricted permissions
            with open(self.secrets_file, 'w') as f:
                json.dump(secrets, f, indent=2)
            
            # chmod 600
            os.chmod(self.secrets_file, 0o600)
        except Exception as e:
            logging.error(f"Failed to save secret: {e}")

    def config_exists(self) -> bool:
        """Check if config file exists"""
        return self.config_file.exists()

    def to_dict(self) -> Dict[str, Any]:
        """Convert settings to dict (excluding paths and methods)"""
        return {
            "llm_provider": self.llm_provider,
            "llm_model": self.llm_model,
            "llm_fallback_providers": self.llm_fallback_providers,
            "port": self.port,
            "host": self.host,
            "auto_open_browser": self.auto_open_browser,
            "max_concurrent_agents": self.max_concurrent_agents,
            "agent_refresh_interval": self.agent_refresh_interval,
            "enable_p2p_network": self.enable_p2p_network,
            "mock_mode": self.mock_mode,
            "debug": self.debug,
            "network_enabled": self.network_enabled,
            "autonomous_enabled": self.autonomous_enabled,
            "log_level": self.log_level
        }

# Global config instance
config = CivionConfig()

# Backward compatibility alias
settings = config

# Add dynamic attribute lookup to handle legacy LLM_PROVIDER etc if needed
# But better to just alias the common ones
config.app_name = "CIVION"
config.app_version = "2.0.0"

# Add properties with setters for keys that were in the pydantic model
def get_legacy_secret(self, key):
    return self.get_secret(key)

# Define properties with both getters and setters for compatibility with setup_wizard
class CivionConfigWithSetters(CivionConfig):
    @property
    def openai_api_key(self): return self.get_secret("OPENAI_API_KEY")
    @openai_api_key.setter
    def openai_api_key(self, value): self.set_secret("OPENAI_API_KEY", value)

    @property
    def anthropic_api_key(self): return self.get_secret("ANTHROPIC_API_KEY")
    @anthropic_api_key.setter
    def anthropic_api_key(self, value): self.set_secret("ANTHROPIC_API_KEY", value)

    @property
    def google_api_key(self): return self.get_secret("GOOGLE_API_KEY")
    @google_api_key.setter
    def google_api_key(self, value): self.set_secret("GOOGLE_API_KEY", value)

    @property
    def github_token(self): return self.get_secret("GITHUB_TOKEN")
    @github_token.setter
    def github_token(self, value): self.set_secret("GITHUB_TOKEN", value)

    @property
    def news_api_key(self): return self.get_secret("NEWS_API_KEY")
    @news_api_key.setter
    def news_api_key(self, value): self.set_secret("NEWS_API_KEY", value)

    @property
    def coingecko_api_key(self): return self.get_secret("COINGECKO_API_KEY")
    @coingecko_api_key.setter
    def coingecko_api_key(self, value): self.set_secret("COINGECKO_API_KEY", value)

    @property
    def frontend_url(self): return f"http://localhost:{self.port}"
    @property
    def database_url(self): return f"sqlite+aiosqlite:///{self.db_path}"

# Re-instantiate with setters
config = CivionConfigWithSetters()
settings = config

def _save_env_file(data: dict):
    """Helper to save multiple secrets at once, used by CLI"""
    for k, v in data.items():
        config.set_secret(k, v)
