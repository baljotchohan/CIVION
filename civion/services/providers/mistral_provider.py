"""
CIVION Mistral Provider
"""
from typing import AsyncGenerator, List, Optional
from .base_provider import BaseProvider

class MistralProvider(BaseProvider):
    async def complete(self, prompt: str, max_tokens: int = 1000, temperature: float = 0.7) -> str:
        try:
            from mistralai.async_client import MistralAsyncClient
            from mistralai.models.chat_completion import ChatMessage
            client = MistralAsyncClient(api_key=self.api_key)
            response = await client.chat(
                model=self.model or "mistral-large-latest",
                messages=[ChatMessage(role="user", content=prompt)],
                max_tokens=max_tokens,
                temperature=temperature
            )
            return response.choices[0].message.content
        except ImportError:
            return "MistralAI package not installed. Run 'pip install mistralai'."
        except Exception as e:
            return f"Mistral Error: {str(e)}"

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
            from mistralai.async_client import MistralAsyncClient
            from mistralai.models.chat_completion import ChatMessage
            client = MistralAsyncClient(api_key=self.api_key)
            stream = client.chat_stream(
                model=self.model or "mistral-large-latest",
                messages=[ChatMessage(role="user", content=prompt)],
                max_tokens=max_tokens,
                temperature=temperature
            )
            async for chunk in stream:
                if chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content
        except ImportError:
            yield "MistralAI package not installed."
        except Exception as e:
            yield f"Error: {str(e)}"

    async def test_connection(self) -> bool:
        try:
            from mistralai.async_client import MistralAsyncClient
            client = MistralAsyncClient(api_key=self.api_key)
            await client.chat(model=self.model or "mistral-large-latest", messages=[{"role": "user", "content": "test"}], max_tokens=1)
            return True
        except:
            return False

    def get_available_models(self) -> List[str]:
        return ["mistral-large-latest", "mistral-medium-latest", "mistral-small-latest", "codestral-latest"]

    def get_cost_estimate(self, tokens: int) -> float:
        return (tokens / 1000000) * 2.0
