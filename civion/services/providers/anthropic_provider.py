"""
CIVION Anthropic Provider
"""
import httpx
from typing import AsyncGenerator, List, Optional, Any
from civion.core.logger import engine_logger
log = engine_logger(__name__)
from .base_provider import BaseProvider

class AnthropicProvider(BaseProvider):
    async def complete(self, prompt: str, max_tokens: int = 1000, temperature: float = 0.7) -> str:
        try:
            import anthropic
            client = anthropic.AsyncAnthropic(api_key=self.api_key)
            response = await client.messages.create(
                model=self.model or "claude-3-5-sonnet-20240620",
                max_tokens=max_tokens,
                temperature=temperature,
                messages=[{"role": "user", "content": prompt}]
            )
            return response.content[0].text
        except ImportError:
            return "Anthropic package not installed. Run 'pip install anthropic'."
        except Exception as e:
            return f"Anthropic Error: {str(e)}"

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
            import anthropic
            client = anthropic.AsyncAnthropic(api_key=self.api_key)
            # Prepare messages: if history provided, use it, otherwise use current prompt
            if not messages:
                messages = [{"role": "user", "content": prompt}]
            
            async with client.messages.stream(
                model=self.model or "claude-3-5-sonnet-20240620",
                max_tokens=max_tokens,
                temperature=temperature,
                system=system,
                messages=messages
            ) as stream:
                async for text in stream.text_stream:
                    yield text
        except ImportError:
            yield "Anthropic package not installed."
        except Exception as e:
            yield f"Error: {str(e)}"

    async def test_connection(self) -> bool:
        try:
            import anthropic
            client = anthropic.AsyncAnthropic(api_key=self.api_key)
            await client.messages.create(
                model=self.model or "claude-3-5-sonnet-20240620",
                max_tokens=1,
                messages=[{"role": "user", "content": "test"}]
            )
            return True
        except httpx.TimeoutException:
            log.warning(f"Anthropic API timeout")
            return self._fallback_response("timeout")
        except httpx.ConnectError:
            log.error(f"Cannot connect to Anthropic API")
            return self._fallback_response("connection_error")
        except httpx.HTTPStatusError as e:
            log.error(f"Anthropic API returned HTTP {e.response.status_code}")
            return self._fallback_response(f"http_{e.response.status_code}")
        except Exception as e:
            log.error(f"Anthropic provider error: {str(e)}")
            return None

    def _fallback_response(self, error_reason: str) -> dict:
        """Return fallback response when API fails."""
        return {
            "error": error_reason,
            "fallback": True,
            "content": "API unavailable, using cached response"
        }

    def get_available_models(self) -> List[str]:
        return ["claude-3-5-sonnet-20240620", "claude-3-opus-20240229", "claude-3-haiku-20240307"]

    def get_cost_estimate(self, tokens: int) -> float:
        # Rough estimate for Sonnet
        return (tokens / 1000000) * 3.0
