"""Test goal endpoints"""
import pytest
from httpx import AsyncClient, ASGITransport
from civion.api.server import app

@pytest.mark.asyncio
async def test_create_goal():
    """Test goal creation"""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/v1/goals",
            json={"title": "Test Goal", "description": "Test"}
        )
        assert response.status_code in [200, 201]
        data = response.json()
        assert 'id' in data
        assert data['title'] == "Test Goal"

@pytest.mark.asyncio
async def test_list_goals():
    """Test listing goals"""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/goals")
        assert response.status_code == 200
        assert isinstance(response.json(), list)

@pytest.mark.asyncio
async def test_get_goal_404():
    """Test 404 on missing goal"""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/goals/nonexistent")
        assert response.status_code == 404
