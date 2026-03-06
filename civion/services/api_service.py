from __future__ import annotations

import httpx
import random
import logging
from typing import Any

from civion.services.llm_service import retry


logger = logging.getLogger("civion.api")


class APIService:
    """Professional async HTTP wrapper with retry logic and mock fallbacks."""

    def __init__(self, timeout: int = 30) -> None:
        self.timeout = timeout

    @retry(retries=2, delay=2.0)
    async def get(
        self,
        url: str,
        params: dict[str, Any] | None = None,
        headers: dict[str, str] | None = None,
        raw: bool = False,
        suppress_errors: bool = True,
    ) -> Any:
        """
        Perform an async GET request with retries and mock fallbacks.
        
        Args:
            url: Target URL.
            params: Query parameters.
            headers: HTTP headers.
            raw: If True, return text instead of JSON.
            suppress_errors: If True, return mock data instead of raising exceptions.
            
        Returns:
            Parsed JSON, raw text, or mock data.
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout, follow_redirects=True) as client:
                resp = await client.get(url, params=params, headers=headers)
                resp.raise_for_status()
                if raw:
                    return resp.text
                try:
                    return resp.json()
                except Exception:
                    return resp.text
        except (httpx.HTTPStatusError, Exception) as e:
            if not suppress_errors:
                raise
            logger.warning(f"API call to {url} failed: {e}. Switching to Mock Data.")
            return self._get_mock_data(url)

    @retry(retries=2, delay=2.0)
    async def post(
        self,
        url: str,
        json: dict[str, Any] | None = None,
        headers: dict[str, str] | None = None,
        suppress_errors: bool = False,
    ) -> Any:
        """Perform an async POST request with retries."""
        try:
            async with httpx.AsyncClient(timeout=self.timeout, follow_redirects=True) as client:
                resp = await client.post(url, json=json, headers=headers)
                resp.raise_for_status()
                try:
                    return resp.json()
                except Exception:
                    return resp.text
        except Exception as e:
            if not suppress_errors:
                raise
            logger.warning(f"POST to {url} failed: {e}")
            return {"status": "error", "message": str(e)}

    def _get_mock_data(self, url: str) -> Any:
        """Generate high-quality mock data for fallback scenarios."""
        if "github" in url:
            return [
                {"name": "CIVION-Core", "description": "Autonomous AI Agent OS", "stargazers_count": random.randint(1200, 5000)},
                {"name": "Neural-Link", "description": "LLM routing layer", "stargazers_count": random.randint(800, 2000)},
                {"name": "Agent-Mesh", "description": "P2P agent communication", "stargazers_count": random.randint(400, 1500)}
            ]
        if "hacker" in url or "ycombinator" in url:
            return [8923412, 8923413, 8923414, 8923415, 8923416]
        if "coingecko" in url or "coin" in url:
            return {"bitcoin": {"usd": random.randint(60000, 100000), "usd_24h_change": random.uniform(-5, 5)}}
        if "arxiv" in url:
            return "<feed><entry><title>Autonomous Agent Reasoning with Recursive Loops</title><link href='https://arxiv.org/abs/24.01.123'/></entry></feed>"
        
        return {"status": "success", "message": "Mock data generated for fallback.", "timestamp": "2026-03-06T15:21:00"}

    async def get_connection_key(self, name: str) -> str | None:
        """Fetch API key from the database connections table."""
        try:
            from civion.storage.database import get_connections
            conns = await get_connections()
            for c in conns:
                if c['name'].lower() == name.lower() or c['name'].lower() in name.lower():
                    return c.get('api_key')
        except Exception:
            pass
        return None



# Module-level singleton
api = APIService()
