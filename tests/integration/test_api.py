"""
Integration tests for CIVION FastAPI endpoints.
"""

import pytest
import civion.storage.database as db
from civion.engine.agent_engine import engine

def test_api_root_serves_dashboard(client):
    """Test the root serves the HTML dashboard."""
    response = client.get("/")
    assert response.status_code == 200
    assert "text/html" in response.headers["content-type"]

@pytest.mark.asyncio
async def test_api_get_agents(client, test_db_path, mock_agent):
    """Test fetching all registered agents."""
    # First, setup data in the mock DB
    await db.register_agent_db("api_agent", "To serve the API", "Servant", 3600, ["api"])
    engine.register_agent(mock_agent)
    
    # We use TestClient from starlette/fastapi which is synchronous
    response = client.get("/api/agents")
    assert response.status_code == 200
    data = response.json()
    
    assert isinstance(data, list)
    titles = [a["name"] for a in data]
    assert "test_agent" in titles

@pytest.mark.asyncio
async def test_api_get_insights(client, test_db_path):
    """Test fetching insights."""
    await db.save_insight("agentX", "Content info", "Title XY")
    
    response = client.get("/api/insights")
    assert response.status_code == 200
    data = response.json()
    
    assert isinstance(data, list)
    assert len(data) > 0
    assert data[0]["title"] == "Title XY"

@pytest.mark.asyncio
async def test_api_system_status(client, test_db_path):
    """Test system status endpoint."""
    response = client.get("/api/system/status")
    assert response.status_code == 200
    data = response.json()
    
    assert data["uptime"] == "Active"
    assert "agents_total" in data
