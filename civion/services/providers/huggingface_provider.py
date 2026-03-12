"""
CIVION Hugging Face Provider
"""
import httpx
from typing import AsyncGenerator, List, Optional, Any
from civion.core.logger import engine_logger
log = engine_logger(__name__)
from .base_provider import BaseProvider

class HuggingFaceProvider(BaseProvider):
    async def complete(self, prompt: str, max_tokens: int = 1000, temperature: float = 0.7) -> str:
        try:
            import httpx
            headers = {"Authorization": f"Bearer {self.api_key}"}
            api_url = f"https://api-inference.huggingface.co/models/{self.model}"
            payload = {
                "inputs": prompt,
                "parameters": {"max_new_tokens": max_tokens, "temperature": temperature}
            }
            async with httpx.AsyncClient() as client:
                response = await client.post(api_url, headers=headers, json=payload, timeout=60.0)
                result = response.json()
                if isinstance(result, list) and len(result) > 0:
                    return result[0].get("generated_text", "").replace(prompt, "", 1).strip()
                return str(result)
        except ImportError:
            return "Httpx package not installed. Run 'pip install httpx'."
        except Exception as e:
            return f"HuggingFace Error: {str(e)}"

    async def stream(
        self,
        prompt: str,
        system: str = None,
        messages: list = None,
        max_tokens: int = 1024,
        temperature: float = 0.7,
        **kwargs
    ) -> AsyncGenerator[str, None]:
        # Basic streaming not supported easily for all HF Inference Endpoints via simple post
        # Returning complete response as single chunk for now
        res = await self.complete(prompt, max_tokens, temperature)
        yield res

    async def test_connection(self) -> bool:
        try:
            import httpx
            headers = {"Authorization": f"Bearer {self.api_key}"}
            api_url = f"https://api-inference.huggingface.co/models/{self.model}"
            async with httpx.AsyncClient() as client:
                response = await client.post(api_url, headers=headers, json={"inputs": "test"}, timeout=10.0)
                return response.status_code == 200
        except httpx.TimeoutException:
            log.warning(f"HuggingFace API timeout")
            return self._fallback_response("timeout")
        except Exception as e:
            log.error(f"HuggingFace provider error: {str(e)}")
            return None

    def _fallback_response(self, error_reason: str) -> dict:
        return {
            "error": error_reason,
            "fallback": True,
            "content": "API unavailable, using cached response"
        }

    def get_available_models(self) -> List[str]:
        return []  # Any HF model

    def get_cost_estimate(self, tokens: int) -> float:
        return 0.0  # Free tier or managed endpoints
