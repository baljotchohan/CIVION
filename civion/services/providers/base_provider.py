"""
CIVION Base LLM Provider
Defines the interface all providers must implement.
"""
import abc
from typing import AsyncGenerator, Dict, List, Optional

class BaseProvider(abc.ABC):
    """Abstract base class for LLM providers"""
    
    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None, **config):
        self.api_key = api_key
        self.model = model
        self.config = config

    @abc.abstractmethod
    async def complete(self, prompt: str, max_tokens: int = 1000, temperature: float = 0.7) -> str:
        """Get complete response from provider"""
        pass

    @abc.abstractmethod
    async def stream(
        self,
        prompt: str,
        system: str = None,
        messages: list = None,
        max_tokens: int = 1024,
        temperature: float = 0.7,
        **kwargs
    ) -> AsyncGenerator[str, None]:
        """Stream response from provider"""
        pass

    @abc.abstractmethod
    async def test_connection(self) -> bool:
        """Verify the API key and model access work"""
        pass

    @abc.abstractmethod
    def get_available_models(self) -> List[str]:
        """List models available for this provider"""
        pass

    @abc.abstractmethod
    def get_cost_estimate(self, tokens: int) -> float:
        """Estimate cost for given tokens"""
        pass
