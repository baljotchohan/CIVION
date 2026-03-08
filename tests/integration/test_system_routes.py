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
    assert response.json()["websocket"] == "active"

def test_system_stats():
    response = client.get("/api/v1/system/stats")
    assert response.status_code == 200
    data = response.json()
    assert "active_agents" in data
    assert "uptime_seconds" in data
    assert "confidence_avg" in data

def test_system_config():
    response = client.get("/api/v1/system/config")
    assert response.status_code == 200
    assert "environment" in response.json()

def test_cors_headers():
    response = client.options("/api/v1/system/status")
    assert response.status_code == 200
    assert "access-control-allow-origin" in response.headers

def test_404_handling():
    response = client.get("/api/v1/system/does-not-exist")
    assert response.status_code == 404

# A few simple prediction tests using TestClient just to bump numbers and test router
def test_predictions_get_all():
    response = client.get("/api/v1/predictions")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_predictions_analyze():
    response = client.post("/api/v1/predictions/analyze", json={"goal": "test"})
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_signals_get_all():
    response = client.get("/api/v1/signals")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_agents_get_all():
    response = client.get("/api/v1/agents")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_personas_get_all():
    response = client.get("/api/v1/personas")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
