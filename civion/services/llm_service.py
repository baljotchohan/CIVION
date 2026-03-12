"""
CIVION Universal LLM Service
Managed all providers and handles fallbacks.
"""
import logging
from civion.core.logger import engine_logger
log = engine_logger(__name__)
from typing import AsyncGenerator, Dict, List, Optional, Any

from civion.core.config import config
from civion.services.providers import (
    AnthropicProvider, OpenAIProvider, GeminiProvider, MistralProvider,
    GroqProvider, CohereProvider, TogetherProvider, PerplexityProvider,
    OllamaProvider, AzureOpenAIProvider, BedrockProvider, HuggingFaceProvider
)

class LLMService:
    """Universal LLM service supporting all providers"""
    
    PROVIDERS = {
        "anthropic": AnthropicProvider,
        "openai": OpenAIProvider,
        "gemini": GeminiProvider,
        "mistral": MistralProvider,
        "groq": GroqProvider,
        "cohere": CohereProvider,
        "together": TogetherProvider,
        "perplexity": PerplexityProvider,
        "ollama": OllamaProvider,
        "azure": AzureOpenAIProvider,
        "bedrock": BedrockProvider,
        "huggingface": HuggingFaceProvider,
    }

    def __init__(self, provider: str = None, model: str = None):
        self.primary_provider_name = provider or config.llm_provider
        self.primary_model = model or config.llm_model
        self.fallbacks = config.llm_fallback_providers

    def _get_provider(self, name: str, model: str = None) -> Any:
        provider_cls = self.PROVIDERS.get(name)
        if not provider_cls:
            raise ValueError(f"Unknown provider: {name}")
        
        # Get credentials from config
        api_key = config.get_secret(f"{name.upper()}_API_KEY")
        # For Gemini, it's GOOGLE_API_KEY
        if name == "gemini" and not api_key:
            api_key = config.get_secret("GOOGLE_API_KEY")
        
        return provider_cls(api_key=api_key, model=model)

    async def complete(self, prompt: str, **kwargs) -> str:
        """Completion with automated fallback"""
        providers_to_try = [self.primary_provider_name] + self.fallbacks
        
        last_error = ""
        for p_name in providers_to_try:
            try:
                provider = self._get_provider(p_name, self.primary_model if p_name == self.primary_provider_name else None)
                result = await provider.complete(prompt, **kwargs)
                if result and not result.startswith("Error"):
                    return result
                last_error = result
            except Exception as e:
                logging.error(f"Provider {p_name} failed: {e}")
                last_error = str(e)
        
        return f"All LLM providers failed. Last error: {last_error}"

    async def generate(self, prompt: str, **kwargs) -> str:
        """Alias for complete() for backward compatibility"""
        return await self.complete(prompt, **kwargs)

    async def stream(
        self,
        prompt: str,
        system: str = None,
        messages: list = None,
        max_tokens: int = 1024,
        temperature: float = 0.7,
        **kwargs
    ) -> AsyncGenerator[str, None]:
        """Streaming completion from active provider"""
        try:
            provider = self._get_provider(self.primary_provider_name, self.primary_model)
            async for chunk in provider.stream(
                prompt=prompt,
                system=system,
                messages=messages,
                max_tokens=max_tokens,
                temperature=temperature,
                **kwargs
            ):
                yield chunk
        except Exception as e:
            logging.error(f"Streaming failed: {e}")
            yield f"Error: {str(e)}"

    @classmethod
    async def test_all_connections(cls) -> Dict[str, bool]:
        """Test all available providers"""
        results = {}
        for name in cls.PROVIDERS:
            try:
                svc = cls(provider=name)
                provider = svc._get_provider(name)
                results[name] = await provider.test_connection()
            except Exception as e:
                log.error(f"LLM service error testing provider {name}: {str(e)}")
                results[name] = False
        return results

# Singleton instance
llm_service = LLMService()
