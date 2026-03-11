"""
CIVION Perplexity Provider
Uses OpenAI-compatible client.
"""
import logging
from typing import AsyncGenerator, List, Optional
from .base_provider import BaseProvider

log = logging.getLogger(__name__)

class PerplexityProvider(BaseProvider):
    async def complete(self, prompt: str, max_tokens: int = 1000, temperature: float = 0.7) -> str:
        try:
            import openai
            client = openai.AsyncOpenAI(api_key=self.api_key, base_url="https://api.perplexity.ai")
            response = await client.chat.completions.create(
                model=self.model or "llama-3.1-sonar-large-128k-online",
                max_tokens=max_tokens,
                temperature=temperature,
                messages=[{"role": "user", "content": prompt}]
            )
            return response.choices[0].message.content
        except ImportError:
            log.error("OpenAI package not installed (required for Perplexity). Run 'pip install openai'.")
            return "OpenAI package not installed (required for Perplexity). Run 'pip install openai'."
        except Exception as e:
            log.error(f"Perplexity Error: {str(e)}")
            return f"Perplexity Error: {str(e)}"

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
            client = openai.AsyncOpenAI(api_key=self.api_key, base_url="https://api.perplexity.ai")
            stream = await client.chat.completions.create(
                model=self.model or "llama-3.1-sonar-large-128k-online",
                max_tokens=max_tokens,
                temperature=temperature,
                messages=[{"role": "user", "content": prompt}],
                stream=True
            )
            async for chunk in stream:
                if chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content
        except ImportError:
            log.error("OpenAI package not installed.")
            yield "OpenAI package not installed."
        except Exception as e:
            log.error(f"Perplexity stream error: {str(e)}")
            yield f"Error: {str(e)}"

    async def test_connection(self) -> bool:
        try:
            import openai
            client = openai.AsyncOpenAI(api_key=self.api_key, base_url="https://api.perplexity.ai")
            await client.chat.completions.create(
                model=self.model or "llama-3.1-sonar-small-128k-online",
                max_tokens=1,
                messages=[{"role": "user", "content": "test"}]
            )
            return True
        except Exception as e:
            log.error(f"Perplexity connection test failed: {e}")
            return False

    def get_available_models(self) -> List[str]:
        return ["llama-3.1-sonar-large-128k-online", "llama-3.1-sonar-small-128k-online"]

    def get_cost_estimate(self, tokens: int) -> float:
        return (tokens / 1000000) * 1.0
