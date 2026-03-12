"""
CIVION OpenAI Provider
"""
import httpx
from typing import AsyncGenerator, List, Optional, Any
from civion.core.logger import engine_logger
log = engine_logger(__name__)
from .base_provider import BaseProvider

class OpenAIProvider(BaseProvider):
    async def complete(self, prompt: str, max_tokens: int = 1000, temperature: float = 0.7) -> str:
        try:
            import openai
            client = openai.AsyncOpenAI(api_key=self.api_key)
            response = await client.chat.completions.create(
                model=self.model or "gpt-4o",
                max_tokens=max_tokens,
                temperature=temperature,
                messages=[{"role": "user", "content": prompt}]
            )
            return response.choices[0].message.content
        except ImportError:
            return "OpenAI package not installed. Run 'pip install openai'."
        except Exception as e:
            return f"OpenAI Error: {str(e)}"

    async def stream(
        self,
        prompt: str,
        system: str = None,
        messages: list = None,
        max_tokens: int = 1024,
        temperature: float = 0.7,
        **kwargs
    ) -> AsyncGenerator[str, None]:
        try:
            import openai
            client = openai.AsyncOpenAI(api_key=self.api_key)
            # Prepare messages: include system prompt if provided
            if not messages:
                messages = []
                if system:
                    messages.append({"role": "system", "content": system})
                messages.append({"role": "user", "content": prompt})
            elif system:
                # Prepend system message to existing history if not there
                if messages[0].get("role") != "system":
                    messages = [{"role": "system", "content": system}] + messages

            stream = await client.chat.completions.create(
                model=self.model or "gpt-4o",
                max_tokens=max_tokens,
                temperature=temperature,
                messages=messages,
                stream=True
            )
            async for chunk in stream:
                if chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content
        except ImportError:
            yield "OpenAI package not installed."
        except Exception as e:
            yield f"Error: {str(e)}"

    async def test_connection(self) -> bool:
        try:
            import openai
            client = openai.AsyncOpenAI(api_key=self.api_key)
            await client.chat.completions.create(
                model=self.model or "gpt-4o",
                max_tokens=1,
                messages=[{"role": "user", "content": "test"}]
            )
            return True
        except httpx.TimeoutError:
            log.warning(f"OpenAI API timeout")
            return self._fallback_response("timeout")
        except httpx.ConnectError:
            log.error(f"Cannot connect to OpenAI API")
            return self._fallback_response("connection_error")
        except httpx.HTTPStatusError as e:
            log.error(f"OpenAI API returned HTTP {e.response.status_code}")
            if e.response.status_code == 429:
                return self._fallback_response("rate_limited")
            return self._fallback_response(f"http_{e.response.status_code}")
        except Exception as e:
            log.error(f"OpenAI provider error: {str(e)}")
            return None

    def _fallback_response(self, error_reason: str) -> dict:
        """Return fallback response when API fails."""
        return {
            "error": error_reason,
            "fallback": True,
            "content": "API unavailable, using cached response"
        }

    def get_available_models(self) -> List[str]:
        return ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo", "o1-preview", "o1-mini"]

    def get_cost_estimate(self, tokens: int) -> float:
        # Rough estimate for GPT-4o
        return (tokens / 1000000) * 5.0
