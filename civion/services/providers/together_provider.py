"""
CIVION Together AI Provider
"""
import httpx
from typing import AsyncGenerator, List, Optional, Any
from civion.core.logger import engine_logger
log = engine_logger(__name__)
from .base_provider import BaseProvider

class TogetherProvider(BaseProvider):
    async def complete(self, prompt: str, max_tokens: int = 1000, temperature: float = 0.7) -> str:
        try:
            import together
            client = together.AsyncClient(api_token=self.api_key)
            response = await client.chat.completions.create(
                model=self.model or "meta-llama/Llama-3-70b-chat-hf",
                max_tokens=max_tokens,
                temperature=temperature,
                messages=[{"role": "user", "content": prompt}]
            )
            return response.choices[0].message.content
        except ImportError:
            return "Together package not installed. Run 'pip install together'."
        except Exception as e:
            return f"Together Error: {str(e)}"

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
            import together
            client = together.AsyncClient(api_token=self.api_key)
            stream = await client.chat.completions.create(
                model=self.model or "meta-llama/Llama-3-70b-chat-hf",
                max_tokens=max_tokens,
                temperature=temperature,
                messages=[{"role": "user", "content": prompt}],
                stream=True
            )
            async for chunk in stream:
                if chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content
        except ImportError:
            yield "Together package not installed."
        except Exception as e:
            yield f"Error: {str(e)}"

    async def test_connection(self) -> bool:
        try:
            import together
            client = together.AsyncClient(api_token=self.api_key)
            await client.chat.completions.create(
                model=self.model or "meta-llama/Llama-3-70b-chat-hf",
                max_tokens=1,
                messages=[{"role": "user", "content": "test"}]
            )
            return True
        except httpx.TimeoutError:
            log.warning(f"Together API timeout")
            return self._fallback_response("timeout")
        except Exception as e:
            log.error(f"Together provider error: {str(e)}")
            return None

    def _fallback_response(self, error_reason: str) -> dict:
        return {
            "error": error_reason,
            "fallback": True,
            "content": "API unavailable, using cached response"
        }

    def get_available_models(self) -> List[str]:
        return ["meta-llama/Llama-3-70b-chat-hf", "mistralai/Mixtral-8x22B-Instruct-v0.1", "NousResearch/Nous-Hermes-2-Yi-34B"]

    def get_cost_estimate(self, tokens: int) -> float:
        return (tokens / 1000000) * 0.9
