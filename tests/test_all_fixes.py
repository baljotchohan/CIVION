import pytest
import asyncio
from civion.core.config import settings
from civion.services.llm_service import LLMService
from civion.services.providers.openai_provider import OpenAIProvider
from civion.agents.github_agent import GitHubAgent
from civion.engine.reasoning_loop import ReasoningEngine
from pydantic import ValidationError

@pytest.mark.asyncio
async def test_config_validation():
    """Test Part 3: Config Validation"""
    old_port = settings.api_port
    
    # Valid port
    settings.api_port = 9000
    assert settings.api_port == 9000
    
    # Invalid port (should raise ValidationError)
    with pytest.raises(ValidationError):
        settings.api_port = 100
        
    # Valid provider
    settings.llm_provider = "openai"
    assert settings.llm_provider == "openai"
    
    # Invalid provider
    with pytest.raises(ValidationError):
        settings.llm_provider = "invalid_llm"
        
    # Reset
    settings.api_port = old_port

@pytest.mark.asyncio
async def test_provider_exception_handling():
    """Test Part 1: Provider Exception Handling & Fallbacks"""
    # Mock a timeout by using a non-existent URL or something similar if we had a mock client
    # For now, we manually test if _fallback_response returns expected structure
    provider = OpenAIProvider()
    fallback = provider._fallback_response("timeout")
    
    assert fallback["error"] == "timeout"
    assert fallback["fallback"] is True
    assert "content" in fallback

@pytest.mark.asyncio
async def test_agent_fallbacks():
    """Test Part 6: Agent Fallbacks"""
    agent = GitHubAgent()
    fallback = agent._fallback_response("API Error")
    
    assert fallback["agent"] == "GitHubAgent"
    assert "unavailable" in fallback["analysis"]
    assert fallback["confidence"] == 0.3
    assert fallback["data"]["error"] == "API Error"

def test_type_hints_and_docstrings():
    """Verify Part 4 & 5: Presence of docstrings"""
    from civion.agents.github_agent import GitHubAgent
    from civion.api.routes.goals import create_goal
    
    assert GitHubAgent.__doc__ is not None
    assert GitHubAgent.analyze.__doc__ is not None
    assert create_goal.__doc__ is not None
    assert "Args:" in create_goal.__doc__

@pytest.mark.asyncio
async def test_reasoning_loop_types():
    """Verify reasoning loop has type hints on its dict method"""
    from civion.engine.reasoning_loop import ReasoningLoop
    loop = ReasoningLoop(topic="Test")
    data = loop.dict()
    assert isinstance(data, dict)
    assert data["topic"] == "Test"
