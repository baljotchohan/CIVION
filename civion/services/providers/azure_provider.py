"""
CIVION Azure OpenAI Provider
"""
import httpx
from typing import AsyncGenerator, List, Optional, Any
from civion.core.logger import engine_logger
log = engine_logger(__name__)
from .base_provider import BaseProvider

class AzureOpenAIProvider(BaseProvider):
    async def complete(self, prompt: str, max_tokens: int = 1000, temperature: float = 0.7) -> str:
        try:
            import openai
            client = openai.AsyncAzureOpenAI(
                api_key=self.api_key,
                api_version=self.config.get("api_version", "2024-02-01"),
                azure_endpoint=self.config.get("endpoint", "")
            )
            response = await client.chat.completions.create(
                model=self.model,  # Required: user's deployment name
                max_tokens=max_tokens,
                temperature=temperature,
                messages=[{"role": "user", "content": prompt}]
            )
            return response.choices[0].message.content
        except ImportError:
            return "OpenAI package not installed. Run 'pip install openai'."
        except Exception as e:
            return f"Azure Error: {str(e)}"

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
            client = openai.AsyncAzureOpenAI(
                api_key=self.api_key,
                api_version=self.config.get("api_version", "2024-02-01"),
                azure_endpoint=self.config.get("endpoint", "")
            )
            stream = await client.chat.completions.create(
                model=self.model,
                max_tokens=max_tokens,
                temperature=temperature,
                messages=[{"role": "user", "content": prompt}],
                stream=True
            )
            async for chunk in stream:
                if chunk.choices and chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content
        except ImportError:
            yield "OpenAI package not installed."
        except Exception as e:
            yield f"Error: {str(e)}"

    async def test_connection(self) -> bool:
        try:
            import openai
            client = openai.AsyncAzureOpenAI(
                api_key=self.api_key,
                api_version=self.config.get("api_version", "2024-02-01"),
                azure_endpoint=self.config.get("endpoint", "")
            )
            await client.chat.completions.create(
                model=self.model,
                max_tokens=1,
                messages=[{"role": "user", "content": "test"}]
            )
            return True
        except httpx.TimeoutException:
            log.warning(f"Azure API timeout")
            return self._fallback_response("timeout")
        except httpx.ConnectError:
            log.error(f"Cannot connect to Azure API")
            return self._fallback_response("connection_error")
        except Exception as e:
            log.error(f"Azure provider error: {str(e)}")
            return None

    def _fallback_response(self, error_reason: str) -> dict:
        return {
            "error": error_reason,
            "fallback": True,
            "content": "API unavailable, using cached response"
        }

    def get_available_models(self) -> List[str]:
        return []  # Managed by user's Azure deployment

    def get_cost_estimate(self, tokens: int) -> float:
        return (tokens / 1000000) * 10.0  # Enterprise pricing vary
