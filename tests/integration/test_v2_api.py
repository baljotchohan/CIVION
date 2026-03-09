import pytest
from fastapi.testclient import TestClient
from civion.api.server import app

client = TestClient(app)

def test_system_status():
    response = client.get("/api/v1/system/status")
    assert response.status_code == 200
    assert response.json()["status"] == "operational"

def test_system_health():
    response = client.get("/api/v1/system/health")
    assert response.status_code == 200
    assert "health" in response.json()
    assert "backend_online" in response.json()

def test_goals_crud():
    # Create
    create_res = client.post("/api/v1/goals", json={"title": "Test Goal V2", "description": "Testing Phase 5 API"})
    assert create_res.status_code == 200
    goal_id = create_res.json().get("id")
    assert goal_id is not None
    
    # List
    list_res = client.get("/api/v1/goals")
    assert list_res.status_code == 200
    assert any(g["id"] == goal_id for g in list_res.json())
    
    # Get
    get_res = client.get(f"/api/v1/goals/{goal_id}")
    assert get_res.status_code == 200
    assert get_res.json()["title"] == "Test Goal V2"

def test_predictions_api():
    # List
    list_res = client.get("/api/v1/predictions")
    assert list_res.status_code == 200
    
    # Stats
    stats_res = client.get("/api/v1/predictions/stats")
    assert stats_res.status_code == 200
    assert "total" in stats_res.json()

def test_personas_api():
    # List
    list_res = client.get("/api/v1/personas")
    assert list_res.status_code == 200
    
    # Create
    create_res = client.post("/api/v1/personas", json={"name": "Test Persona", "prompt": "Test Prompt"})
    assert create_res.status_code == 200
    persona_id = create_res.json().get("id")
    
    # Get
    get_res = client.get(f"/api/v1/personas/{persona_id}")
    assert get_res.status_code == 200

def test_marketplace_api():
    # Search
    search_res = client.get("/api/v1/marketplace/search?query=crypto")
    assert search_res.status_code == 200
    assert "agents" in search_res.json()
    
    # Stats
    stats_res = client.get("/api/v1/marketplace/stats")
    assert stats_res.status_code == 200

def test_assistant_api():
    # Suggestions
    sug_res = client.get("/api/v1/assistant/suggestions")
    assert sug_res.status_code == 200
    assert "suggestions" in sug_res.json()
    
    # Context
    ctx_res = client.post("/api/v1/assistant/context")
    assert ctx_res.status_code == 200
