"""
CIVION — Unified LLM Service
Provides a single generate() interface that dispatches to Ollama, OpenAI, or Gemini
based on the user's config.
"""

from __future__ import annotations

import httpx
import asyncio
import logging
from functools import wraps
from typing import Any, Callable, TypeVar

from civion.config.settings import settings

logger = logging.getLogger("civion.services.llm")

T = TypeVar("T")

def retry(retries: int = 3, delay: float = 1.0, backoff: float = 2.0):
    """Retry decorator for handling transient LLM/API failures."""
    def decorator(func: Callable[..., Any]):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            current_delay = delay
            for attempt in range(retries):
                try:
                    return await func(*args, **kwargs)
                except Exception as exc:
                    if attempt == retries - 1:
                        logger.error(f"Final attempt failed for {func.__name__}: {exc}")
                        raise
                    logger.warning(f"Attempt {attempt + 1} failed for {func.__name__}: {exc}. Retrying in {current_delay}s...")
                    await asyncio.sleep(current_delay)
                    current_delay *= backoff
            return await func(*args, **kwargs)
        return wrapper
    return decorator


class LLMService:
    """Thin abstraction over multiple LLM providers with retry logic and type hints."""

    def __init__(self) -> None:
        self.provider: str = settings.llm.provider.lower()
        self.model: str = settings.llm.model

    # ── Public API ────────────────────────────────────────────

    @retry(retries=3, delay=1.0)
    async def generate(self, prompt: str, system: str = "") -> str:
        """
        Send a prompt to the active LLM provider and return the response text.
        
        Args:
            prompt: The user prompt to send.
            system: Optional system instructions.
            
        Returns:
            The generated response text from the LLM.
        """
        if self.provider == "ollama":
            return await self._ollama(prompt, system)
        elif self.provider == "openai":
            return await self._openai(prompt, system)
        elif self.provider == "gemini":
            return await self._gemini(prompt, system)
        else:
            logger.error(f"Unsupported LLM provider: {self.provider}")
            return f"[LLM provider '{self.provider}' is not supported]"

    # ── Ollama (local) ────────────────────────────────────────

    async def _ollama(self, prompt: str, system: str) -> str:
        """Call local Ollama instance."""
        url = f"{settings.llm.ollama_url}/api/generate"
        payload = {
            "model": self.model,
            "prompt": prompt,
            "system": system,
            "stream": False,
        }
        async with httpx.AsyncClient(timeout=120) as client:
            resp = await client.post(url, json=payload)
            resp.raise_for_status()
            return resp.json().get("response", "")

    # ── OpenAI ────────────────────────────────────────────────

    async def _openai(self, prompt: str, system: str) -> str:
        """Call OpenAI API via official client."""
        from openai import AsyncOpenAI

        client = AsyncOpenAI(api_key=settings.llm.openai_api_key)
        messages = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": prompt})

        response = await client.chat.completions.create(
            model=self.model,
            messages=messages,
        )
        return response.choices[0].message.content or ""

    # ── Gemini ────────────────────────────────────────────────

    async def _gemini(self, prompt: str, system: str) -> str:
        """Call Google Gemini API."""
        import google.generativeai as genai

        genai.configure(api_key=settings.llm.gemini_api_key)
        model = genai.GenerativeModel(self.model)
        full_prompt = f"{system}\n\n{prompt}" if system else prompt
        response = model.generate_content(full_prompt)
        return response.text or ""



# Module-level singleton
llm = LLMService()
