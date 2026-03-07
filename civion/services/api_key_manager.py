"""
CIVION API Key Manager
Secure storage and management of API keys.
"""
from __future__ import annotations
import json
import os
from pathlib import Path
from typing import Dict, Optional
from civion.core.config import settings
from civion.core.logger import get_logger

log = get_logger("api_keys")


class APIKeyManager:
    """Manages API keys with local file storage."""

    def __init__(self):
        self._keys_file = settings.data_dir / "api_keys.json"
        self._keys: Dict[str, str] = {}
        self._load()

    def _load(self):
        """Load keys from file."""
        if self._keys_file.exists():
            try:
                self._keys = json.loads(self._keys_file.read_text())
            except Exception:
                self._keys = {}

    def _save(self):
        """Save keys to file."""
        self._keys_file.write_text(json.dumps(self._keys, indent=2))

    def set_key(self, service: str, key: str) -> None:
        """Store an API key."""
        self._keys[service] = key
        self._save()
        log.info(f"API key stored for: {service}")

    def get_key(self, service: str) -> Optional[str]:
        """Retrieve an API key."""
        # Check environment first, then stored keys
        env_map = {
            "openai": "OPENAI_API_KEY",
            "anthropic": "ANTHROPIC_API_KEY",
            "google": "GOOGLE_API_KEY",
            "github": "GITHUB_TOKEN",
            "news": "NEWS_API_KEY",
            "coingecko": "COINGECKO_API_KEY",
        }
        env_var = env_map.get(service)
        if env_var:
            env_val = os.getenv(env_var)
            if env_val:
                return env_val
        return self._keys.get(service)

    def delete_key(self, service: str) -> bool:
        """Delete an API key."""
        if service in self._keys:
            del self._keys[service]
            self._save()
            return True
        return False

    def list_services(self) -> Dict[str, bool]:
        """List all services and whether they have keys configured."""
        services = ["openai", "anthropic", "google", "github", "news", "coingecko"]
        return {s: bool(self.get_key(s)) for s in services}


# Singleton
api_key_manager = APIKeyManager()
