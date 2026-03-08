"""
CIVION Groq Provider
"""
from typing import AsyncGenerator, List, Optional
from .base_provider import BaseProvider

class GroqProvider(BaseProvider):
    async def complete(self, prompt: str, max_tokens: int = 1000, temperature: float = 0.7) -> str:
        try:
            from groq import AsyncGroq
            client = AsyncGroq(api_key=self.api_key)
            response = await client.chat.completions.create(
                model=self.model or "llama-3.1-70b-versatile",
                max_tokens=max_tokens,
                temperature=temperature,
                messages=[{"role": "user", "content": prompt}]
            )
            return response.choices[0].message.content
        except ImportError:
            return "Groq package not installed. Run 'pip install groq'."
        except Exception as e:
            return f"Groq Error: {str(e)}"

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
            from groq import AsyncGroq
            client = AsyncGroq(api_key=self.api_key)
            stream = await client.chat.completions.create(
                model=self.model or "llama-3.1-70b-versatile",
                max_tokens=max_tokens,
                temperature=temperature,
                messages=[{"role": "user", "content": prompt}],
                stream=True
            )
            async for chunk in stream:
                if chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content
        except ImportError:
            yield "Groq package not installed."
        except Exception as e:
            yield f"Error: {str(e)}"

    async def test_connection(self) -> bool:
        try:
            from groq import AsyncGroq
            client = AsyncGroq(api_key=self.api_key)
            await client.chat.completions.create(
                model=self.model or "llama-3.1-8b-instant",
                max_tokens=1,
                messages=[{"role": "user", "content": "test"}]
            )
            return True
        except:
            return False

    def get_available_models(self) -> List[str]:
        return ["llama-3.1-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768", "gemma2-9b-it"]

    def get_cost_estimate(self, tokens: int) -> float:
        return (tokens / 1000000) * 0.7
