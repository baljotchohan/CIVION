"""
CIVION — Unified LLM Service
Provides a single generate() interface that dispatches to Ollama, OpenAI, or Gemini
based on the user's config.
"""

from __future__ import annotations

import httpx

from civion.config.settings import settings


class LLMService:
    """Thin abstraction over multiple LLM providers."""

    def __init__(self) -> None:
        self.provider = settings.llm.provider.lower()
        self.model = settings.llm.model

    # ── Public API ────────────────────────────────────────────

    async def generate(self, prompt: str, system: str = "") -> str:
        """Send a prompt to the active LLM provider and return the response text."""
        if self.provider == "ollama":
            return await self._ollama(prompt, system)
        elif self.provider == "openai":
            return await self._openai(prompt, system)
        elif self.provider == "gemini":
            return await self._gemini(prompt, system)
        else:
            return f"[LLM provider '{self.provider}' is not supported]"

    # ── Ollama (local) ────────────────────────────────────────

    async def _ollama(self, prompt: str, system: str) -> str:
        url = f"{settings.llm.ollama_url}/api/generate"
        payload = {
            "model": self.model,
            "prompt": prompt,
            "system": system,
            "stream": False,
        }
        try:
            async with httpx.AsyncClient(timeout=120) as client:
                resp = await client.post(url, json=payload)
                resp.raise_for_status()
                return resp.json().get("response", "")
        except Exception as exc:
            return f"[Ollama error: {exc}]"

    # ── OpenAI ────────────────────────────────────────────────

    async def _openai(self, prompt: str, system: str) -> str:
        try:
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
        except Exception as exc:
            return f"[OpenAI error: {exc}]"

    # ── Gemini ────────────────────────────────────────────────

    async def _gemini(self, prompt: str, system: str) -> str:
        try:
            import google.generativeai as genai

            genai.configure(api_key=settings.llm.gemini_api_key)
            model = genai.GenerativeModel(self.model)
            full_prompt = f"{system}\n\n{prompt}" if system else prompt
            response = model.generate_content(full_prompt)
            return response.text or ""
        except Exception as exc:
            return f"[Gemini error: {exc}]"


# Module-level singleton
llm = LLMService()
