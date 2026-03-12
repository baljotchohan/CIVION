"""
CIVION Cohere Provider
"""
import httpx
from typing import AsyncGenerator, List, Optional, Any
from civion.core.logger import engine_logger
log = engine_logger(__name__)
from .base_provider import BaseProvider

class CohereProvider(BaseProvider):
    async def complete(self, prompt: str, max_tokens: int = 1000, temperature: float = 0.7) -> str:
        try:
            import cohere
            client = cohere.AsyncClient(api_key=self.api_key)
            response = await client.chat(
                model=self.model or "command-r-plus",
                message=prompt,
                max_tokens=max_tokens,
                temperature=temperature
            )
            return response.text
        except ImportError:
            return "Cohere package not installed. Run 'pip install cohere'."
        except Exception as e:
            return f"Cohere Error: {str(e)}"

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
            import cohere
            client = cohere.AsyncClient(api_key=self.api_key)
            async for chunk in client.chat_stream(
                model=self.model or "command-r-plus",
                message=prompt,
                max_tokens=max_tokens,
                temperature=temperature
            ):
                if chunk.event_type == "text-generation":
                    yield chunk.text
        except ImportError:
            yield "Cohere package not installed."
        except Exception as e:
            yield f"Error: {str(e)}"

    async def test_connection(self) -> bool:
        try:
            import cohere
            client = cohere.AsyncClient(api_key=self.api_key)
            await client.chat(message="test", max_tokens=1)
            return True
        except httpx.TimeoutError:
            log.warning(f"Cohere API timeout")
            return self._fallback_response("timeout")
        except Exception as e:
            log.error(f"Cohere provider error: {str(e)}")
            return None

    def _fallback_response(self, error_reason: str) -> dict:
        return {
            "error": error_reason,
            "fallback": True,
            "content": "API unavailable, using cached response"
        }

    def get_available_models(self) -> List[str]:
        return ["command-r-plus", "command-r", "command"]

    def get_cost_estimate(self, tokens: int) -> float:
        return (tokens / 1000000) * 1.5
