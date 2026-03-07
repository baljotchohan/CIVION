"""
CIVION LLM Service
Multi-provider abstraction for Claude, GPT, Gemini with mock fallback.
"""
from __future__ import annotations
import json
import random
from typing import Optional, Dict, Any, List
from civion.core.logger import get_logger
from civion.core.config import settings

log = get_logger("llm")


class LLMService:
    """Unified interface to multiple LLM providers."""

    def __init__(self):
        self.provider = settings.llm_provider
        self._client = None

    async def generate(
        self,
        prompt: str,
        system: str = "You are CIVION, an AI intelligence analyst.",
        temperature: float = 0.7,
        max_tokens: int = 1024,
    ) -> str:
        """Generate text from the configured LLM provider."""
        if self.provider == "mock":
            return await self._mock_generate(prompt)
        elif self.provider == "openai":
            return await self._openai_generate(prompt, system, temperature, max_tokens)
        elif self.provider == "anthropic":
            return await self._anthropic_generate(prompt, system, temperature, max_tokens)
        elif self.provider == "google":
            return await self._google_generate(prompt, system, temperature, max_tokens)
        else:
            log.warning(f"Unknown provider '{self.provider}', falling back to mock")
            return await self._mock_generate(prompt)

    async def analyze(self, data: str, instruction: str) -> Dict[str, Any]:
        """Analyze data and return structured JSON."""
        prompt = f"""Analyze the following data and respond in JSON format.

Instruction: {instruction}

Data:
{data}

Respond with valid JSON only."""
        result = await self.generate(prompt)
        try:
            return json.loads(result)
        except json.JSONDecodeError:
            return {"analysis": result, "raw": True}

    async def _openai_generate(
        self, prompt: str, system: str, temperature: float, max_tokens: int
    ) -> str:
        try:
            import httpx
            async with httpx.AsyncClient() as client:
                resp = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={"Authorization": f"Bearer {settings.openai_api_key}"},
                    json={
                        "model": "gpt-4o-mini",
                        "messages": [
                            {"role": "system", "content": system},
                            {"role": "user", "content": prompt},
                        ],
                        "temperature": temperature,
                        "max_tokens": max_tokens,
                    },
                    timeout=30.0,
                )
                resp.raise_for_status()
                return resp.json()["choices"][0]["message"]["content"]
        except Exception as e:
            log.error(f"OpenAI error: {e}")
            return await self._mock_generate(prompt)

    async def _anthropic_generate(
        self, prompt: str, system: str, temperature: float, max_tokens: int
    ) -> str:
        try:
            import httpx
            async with httpx.AsyncClient() as client:
                resp = await client.post(
                    "https://api.anthropic.com/v1/messages",
                    headers={
                        "x-api-key": settings.anthropic_api_key,
                        "anthropic-version": "2023-06-01",
                        "content-type": "application/json",
                    },
                    json={
                        "model": "claude-3-5-sonnet-20241022",
                        "system": system,
                        "messages": [{"role": "user", "content": prompt}],
                        "temperature": temperature,
                        "max_tokens": max_tokens,
                    },
                    timeout=30.0,
                )
                resp.raise_for_status()
                return resp.json()["content"][0]["text"]
        except Exception as e:
            log.error(f"Anthropic error: {e}")
            return await self._mock_generate(prompt)

    async def _google_generate(
        self, prompt: str, system: str, temperature: float, max_tokens: int
    ) -> str:
        try:
            import httpx
            async with httpx.AsyncClient() as client:
                resp = await client.post(
                    f"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={settings.google_api_key}",
                    json={
                        "contents": [{"parts": [{"text": f"{system}\n\n{prompt}"}]}],
                        "generationConfig": {
                            "temperature": temperature,
                            "maxOutputTokens": max_tokens,
                        },
                    },
                    timeout=30.0,
                )
                resp.raise_for_status()
                return resp.json()["candidates"][0]["content"]["parts"][0]["text"]
        except Exception as e:
            log.error(f"Google error: {e}")
            return await self._mock_generate(prompt)

    async def _mock_generate(self, prompt: str) -> str:
        """Generate mock intelligence responses."""
        topics = [
            "emerging AI robotics ecosystem", "quantum computing breakthrough",
            "decentralized finance disruption", "biotech convergence trend",
            "cybersecurity threat evolution", "edge computing paradigm shift",
        ]
        analyses = [
            f"Analysis indicates a significant shift in {random.choice(topics)}. "
            f"Confidence level: {random.uniform(0.6, 0.95):.2f}. "
            f"Multiple data sources confirm this trend with {random.randint(3, 12)} corroborating signals.",
            f"Cross-referencing {random.randint(5, 20)} sources reveals "
            f"convergence in {random.choice(topics)}. "
            f"This pattern has historical parallels with a {random.uniform(0.7, 0.92):.0%} match rate.",
            f"Predictive models suggest {random.choice(topics)} will accelerate "
            f"within {random.randint(2, 18)} months. "
            f"Key drivers: funding ({random.randint(10, 500)}M), talent migration, regulatory shifts.",
        ]
        return random.choice(analyses)

    @property
    def is_configured(self) -> bool:
        """Check if a real LLM provider is configured."""
        if self.provider == "openai":
            return bool(settings.openai_api_key)
        elif self.provider == "anthropic":
            return bool(settings.anthropic_api_key)
        elif self.provider == "google":
            return bool(settings.google_api_key)
        return True  # mock is always configured


# Singleton
llm_service = LLMService()
