"""
CIVION — API Service
Reusable async HTTP helper for agents that need to call external APIs.
"""

from __future__ import annotations

from typing import Any

import httpx


class APIService:
    """Thin async HTTP wrapper for making external API calls."""

    def __init__(self, timeout: int = 30) -> None:
        self.timeout = timeout

    async def get(
        self,
        url: str,
        params: dict[str, Any] | None = None,
        headers: dict[str, str] | None = None,
        raw: bool = False,
    ) -> dict[str, Any] | list | str:
        """Perform an async GET request and return parsed JSON (or raw text)."""
        async with httpx.AsyncClient(timeout=self.timeout, follow_redirects=True) as client:
            resp = await client.get(url, params=params, headers=headers)
            resp.raise_for_status()
            if raw:
                return resp.text
            try:
                return resp.json()
            except Exception:
                return resp.text

    async def post(
        self,
        url: str,
        json: dict[str, Any] | None = None,
        headers: dict[str, str] | None = None,
    ) -> dict[str, Any] | list | str:
        """Perform an async POST request."""
        async with httpx.AsyncClient(timeout=self.timeout, follow_redirects=True) as client:
            resp = await client.post(url, json=json, headers=headers)
            resp.raise_for_status()
            try:
                return resp.json()
            except Exception:
                return resp.text


# Module-level singleton
api = APIService()
