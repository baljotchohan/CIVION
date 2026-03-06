"""
CIVION — Test Fixtures
Shared pytest fixtures and mocks for fast, isolated testing.
"""

from __future__ import annotations

import asyncio
import os
import sqlite3
import tempfile
from pathlib import Path

import pytest
import pytest_asyncio
from fastapi.testclient import TestClient

from civion.api.server import app
from civion.services.api_service import APIService
from civion.services.llm_service import LLMService

# ── Database Fixtures ─────────────────────────────────────────

@pytest_asyncio.fixture
async def test_db_path(monkeypatch):
    """Provides a temporary SQLite database path and mounts it."""
    fd, path = tempfile.mkstemp(suffix=".db")
    os.close(fd)
    
    # Mock setting in DB module
    import civion.storage.database as db_module
    old_db_path = db_module.DB_PATH
    db_module.DB_PATH = Path(path)
    
    # Also patch it in other modules that import it statically
    import civion.engine.collaboration_engine as collab_module
    old_collab_db_path = getattr(collab_module, "DB_PATH", old_db_path)
    collab_module.DB_PATH = Path(path)
    
    import civion.services.memory_graph as memory_module
    old_memory_db_path = getattr(memory_module, "DB_PATH", old_db_path)
    memory_module.DB_PATH = Path(path)
    
    # Initialize the tables
    await db_module.init_db()
    
    yield path
    
    # Cleanup
    db_module.DB_PATH = old_db_path
    collab_module.DB_PATH = old_collab_db_path
    memory_module.DB_PATH = old_memory_db_path
    if os.path.exists(path):
        os.unlink(path)

# ── API Client Fixtures ───────────────────────────────────────

@pytest.fixture
def client():
    """Returns a FastAPI TestClient."""
    return TestClient(app)

# ── Mock External Services ────────────────────────────────────

class MockAPIService(APIService):
    """Mocks the external API service."""
    
    def __init__(self):
        super().__init__()
        self.mock_responses = {}
        self.mock_text_responses = {}
        
    def set_mock_response(self, url: str, response: dict | list):
        self.mock_responses[url] = response

    def set_mock_text(self, url: str, response: str):
        self.mock_text_responses[url] = response
        
    async def get(self, url: str, params=None, headers=None, raw=False):
        if url in self.mock_responses and not raw:
            return self.mock_responses[url]
        if url in self.mock_text_responses:
            return self.mock_text_responses[url]
        return {"status": "mocked", "url": url}

    async def post(self, url: str, json=None, headers=None):
        if url in self.mock_responses:
            return self.mock_responses[url]
        return {"status": "mocked", "url": url}

@pytest.fixture
def mock_api(monkeypatch):
    """Provides a mock API service that doesn't hit the internet."""
    mock_service = MockAPIService()
    
    # We monkeypatch the APIService class `get` and `post` methods
    async def mock_get(self, url: str, params=None, headers=None, raw=False):
        return await mock_service.get(url, params, headers, raw)
        
    async def mock_post(self, url: str, json=None, headers=None):
        return await mock_service.post(url, json, headers)
        
    monkeypatch.setattr("civion.services.api_service.APIService.get", mock_get)
    monkeypatch.setattr("civion.services.api_service.APIService.post", mock_post)
    return mock_service

class MockLLMService(LLMService):
    """Mocks the LLM service to avoid API costs and slow tests."""
    
    def __init__(self):
        super().__init__()
        self.last_prompt = ""
        self.fixed_response = None
        
    async def generate(self, prompt: str, system: str | None = None) -> str:
        self.last_prompt = prompt
        if self.fixed_response:
            return self.fixed_response
        return "Mocked LLM analysis output. Indicates success and deep thought."

@pytest.fixture
def mock_llm(monkeypatch):
    """Provides a mock LLM service."""
    mock_service = MockLLMService()
    monkeypatch.setattr("civion.services.llm_service.LLMService.generate", mock_service.generate)
    return mock_service

# ── Agent Fixtures ────────────────────────────────────────────

@pytest.fixture
def mock_agent():
    """Provides a simple mock agent for engine testing."""
    from civion.agents.base_agent import BaseAgent, AgentResult

    class TestAgent(BaseAgent):
        name = "test_agent"
        description = "A test agent"
        interval = 3600
        personality = "Watcher"

        async def run(self) -> AgentResult:
            return AgentResult(
                success=True,
                title="Test Run",
                content="Mock output",
                events=[{"topic": "Test event", "latitude": 0, "longitude": 0}]
            )

    return TestAgent()
