"""
CIVION Cache Service
In-memory cache with TTL support. Redis-compatible interface.
"""
from __future__ import annotations
import time
import json
from typing import Any, Optional, Dict
from civion.core.logger import get_logger

log = get_logger("cache")


class CacheEntry:
    __slots__ = ("value", "expires_at")

    def __init__(self, value: Any, ttl: Optional[int] = None):
        self.value = value
        self.expires_at = time.time() + ttl if ttl else None

    @property
    def is_expired(self) -> bool:
        return self.expires_at is not None and time.time() > self.expires_at


class CacheService:
    """In-memory cache with TTL, mimics Redis interface."""

    def __init__(self):
        self._store: Dict[str, CacheEntry] = {}
        self._hits = 0
        self._misses = 0

    async def get(self, key: str) -> Optional[Any]:
        entry = self._store.get(key)
        if entry is None:
            self._misses += 1
            return None
        if entry.is_expired:
            del self._store[key]
            self._misses += 1
            return None
        self._hits += 1
        return entry.value

    async def set(self, key: str, value: Any, ttl: Optional[int] = 300) -> None:
        self._store[key] = CacheEntry(value, ttl)

    async def delete(self, key: str) -> bool:
        if key in self._store:
            del self._store[key]
            return True
        return False

    async def exists(self, key: str) -> bool:
        entry = self._store.get(key)
        if entry and not entry.is_expired:
            return True
        return False

    async def clear(self) -> int:
        count = len(self._store)
        self._store.clear()
        return count

    async def keys(self, pattern: str = "*") -> list:
        if pattern == "*":
            return [k for k, v in self._store.items() if not v.is_expired]
        return [
            k for k, v in self._store.items()
            if not v.is_expired and pattern.replace("*", "") in k
        ]

    async def get_stats(self) -> Dict[str, Any]:
        self._cleanup()
        total = self._hits + self._misses
        return {
            "entries": len(self._store),
            "hits": self._hits,
            "misses": self._misses,
            "hit_rate": f"{(self._hits / total * 100):.1f}%" if total else "0%",
        }

    def _cleanup(self):
        expired = [k for k, v in self._store.items() if v.is_expired]
        for k in expired:
            del self._store[k]


# Singleton
cache_service = CacheService()
