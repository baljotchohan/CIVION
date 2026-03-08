"""
CIVION Ollama Provider
100% Local AI.
"""
from typing import AsyncGenerator, List, Optional
from .base_provider import BaseProvider

class OllamaProvider(BaseProvider):
    async def complete(self, prompt: str, max_tokens: int = 1000, temperature: float = 0.7) -> str:
        try:
            import ollama
            client = ollama.AsyncClient(host=self.config.get("host", "http://localhost:11434"))
            response = await client.chat(
                model=self.model or "llama3.2",
                messages=[{"role": "user", "content": prompt}]
            )
            return response["message"]["content"]
        except ImportError:
            return "Ollama package not installed. Run 'pip install ollama'."
        except Exception as e:
            return f"Ollama Error: {str(e)}"

    async def stream(self, prompt: str, max_tokens: int = 1000, temperature: float = 0.7) -> AsyncGenerator[str, None]:
        try:
            import ollama
            client = ollama.AsyncClient(host=self.config.get("host", "http://localhost:11434"))
            async for chunk in await client.chat(
                model=self.model or "llama3.2",
                messages=[{"role": "user", "content": prompt}],
                stream=True
            ):
                yield chunk["message"]["content"]
        except ImportError:
            yield "Ollama package not installed."
        except Exception as e:
            yield f"Error: {str(e)}"

    async def test_connection(self) -> bool:
        try:
            import ollama
            client = ollama.AsyncClient(host=self.config.get("host", "http://localhost:11434"))
            await client.ps()
            return True
        except:
            return False

    def get_available_models(self) -> List[str]:
        # Ideally would call client.list() but let's return common models
        return ["llama3.2", "mistral", "codellama", "phi3", "gemma2", "qwen2.5"]

    def get_cost_estimate(self, tokens: int) -> float:
        return 0.0  # Locally hosted - free
