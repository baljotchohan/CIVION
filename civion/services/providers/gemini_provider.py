"""
CIVION Gemini Provider
"""
import httpx
from typing import AsyncGenerator, List, Optional, Any
from civion.core.logger import engine_logger
log = engine_logger(__name__)
from .base_provider import BaseProvider

class GeminiProvider(BaseProvider):
    async def complete(self, prompt: str, max_tokens: int = 1000, temperature: float = 0.7) -> str:
        try:
            import google.generativeai as genai
            genai.configure(api_key=self.api_key)
            model = genai.GenerativeModel(self.model or "gemini-1.5-pro")
            response = await model.generate_content_async(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    max_output_tokens=max_tokens,
                    temperature=temperature
                )
            )
            if response and response.text:
                log.info(f"Gemini generation successful ({len(response.text)} chars)")
                return response.text
            log.warning("Gemini returned empty response")
            return "Error: Empty response from Gemini"
        except ImportError:
            return "Google Generative AI package not installed. Run 'pip install google-generativeai'."
        except Exception as e:
            return f"Gemini Error: {str(e)}"

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
            import google.generativeai as genai
            genai.configure(api_key=self.api_key)
            model = genai.GenerativeModel(self.model or "gemini-1.5-pro")
            response = await model.generate_content_async(
                prompt,
                stream=True,
                generation_config=genai.types.GenerationConfig(
                    max_output_tokens=max_tokens,
                    temperature=temperature
                )
            )
            async for chunk in response:
                yield chunk.text
        except ImportError:
            yield "Google Generative AI package not installed."
        except Exception as e:
            yield f"Error: {str(e)}"

    async def test_connection(self) -> bool:
        try:
            import google.generativeai as genai
            genai.configure(api_key=self.api_key)
            model = genai.GenerativeModel(self.model or "gemini-1.5-pro")
            await model.generate_content_async("test")
            return True
        except (httpx.TimeoutException, httpx.HTTPError):
            log.warning(f"Gemini API timeout")
            return self._fallback_response("timeout")
        except Exception as e:
            log.error(f"Gemini provider error: {str(e)}")
            return None

    def _fallback_response(self, error_reason: str) -> dict:
        return {
            "error": error_reason,
            "fallback": True,
            "content": "API unavailable, using cached response"
        }

    def get_available_models(self) -> List[str]:
        return ["gemini-1.5-pro", "gemini-1.5-flash", "gemini-1.0-pro"]

    def get_cost_estimate(self, tokens: int) -> float:
        # Rough estimate for Gemini 1.5 Pro
        return (tokens / 1000000) * 1.25
