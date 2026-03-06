"""
Unit tests for CIVION external services (API and LLM).
"""

import pytest
from civion.services.api_service import APIService
from civion.services.llm_service import LLMService

# --- APIService Tests ---

@pytest.mark.asyncio
async def test_api_service_get_json(httpx_mock):
    """Test successful GET request returning JSON."""
    httpx_mock.add_response(url="https://api.example.com/data", json={"key": "value"})
    
    api = APIService()
    result = await api.get("https://api.example.com/data")
    
    assert result == {"key": "value"}

@pytest.mark.asyncio
async def test_api_service_get_raw(httpx_mock):
    """Test successful GET request returning raw text."""
    httpx_mock.add_response(url="https://api.example.com/text", text="raw string data")
    
    api = APIService()
    result = await api.get("https://api.example.com/text", raw=True)
    
    assert result == "raw string data"

@pytest.mark.asyncio
async def test_api_service_get_failure(httpx_mock):
    """Test GET request failure handles gracefully by throwing error."""
    import httpx
    # Mock failures with reusability to satisfy retry logic (retries=2 means 3 attempts total)
    httpx_mock.add_response(url="https://api.example.com/fail", status_code=500, is_reusable=True)
    
    api = APIService()
    
    with pytest.raises(httpx.HTTPStatusError):
        await api.get("https://api.example.com/fail", suppress_errors=False)

@pytest.mark.asyncio
async def test_api_service_post_json(httpx_mock):
    """Test successful POST request."""
    httpx_mock.add_response(url="https://api.example.com/post", json={"created": True}, status_code=201)
    
    api = APIService()
    result = await api.post("https://api.example.com/post", json={"data": "test"})
    
    assert result == {"created": True}

# --- LLMService Tests ---

@pytest.mark.asyncio
async def test_llm_service_generate_ollama(test_db_path, httpx_mock):
    """Test LLM service generates using default Ollama provider."""
    import civion.storage.database as db
    await db.save_provider(
        name="Local Ollama",
        provider="ollama",
        model="llama3",
        api_key="",
        url="http://localhost:11434",
        is_default=True
    )
    
    # Needs a mock response matching Ollama format
    httpx_mock.add_response(
        url="http://localhost:11434/api/generate",
        json={"response": "Ollama analyzed the data."}
    )
    
    llm = LLMService()
    result = await llm.generate("Analyze this.", system="Sys prompt")
    
    assert "Ollama analyzed" in result

@pytest.mark.asyncio
async def test_llm_service_generate_openai(test_db_path, httpx_mock, monkeypatch):
    """Test LLM service generates using OpenAI provider."""
    import civion.storage.database as db
    await db.save_provider(
        name="OpenAI GPT",
        provider="openai",
        model="gpt-4o",
        api_key="sk-test",
        url="",
        is_default=True
    )
    
    # Mocking openai package
    class MockChatCompletionMessage:
        content = "OpenAI generated this."

    class MockChatCompletionChoice:
        message = MockChatCompletionMessage()

    class MockChatCompletion:
        choices = [MockChatCompletionChoice()]

    class MockCompletions:
        async def create(self, **kwargs):
            return MockChatCompletion()

    class MockChat:
        completions = MockCompletions()

    class MockAsyncOpenAI:
        def __init__(self, api_key):
            self.chat = MockChat()

    import sys
    from unittest.mock import MagicMock
    mock_openai_module = MagicMock()
    mock_openai_module.AsyncOpenAI = MockAsyncOpenAI
    monkeypatch.setitem(sys.modules, "openai", mock_openai_module)
    
    llm = LLMService()
    # Mock settings.llm.provider = "openai" so it triggers the path
    llm.provider = "openai"
    result = await llm.generate("Analyze this.")
    
    assert "OpenAI generated this." in result
