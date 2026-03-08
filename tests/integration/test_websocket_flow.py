import pytest
import asyncio
from fastapi.testclient import TestClient
from fastapi.websockets import WebSocket
from civion.api.server import app
from civion.api.websocket import ConnectionManager

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture
def manager():
    return ConnectionManager()

def test_websocket_connect(client):
    with client.websocket_connect("/ws/test_client") as websocket:
        data = websocket.receive_json()
        assert data["type"] == "system_event"
        assert data["data"]["message"] == "Connected to CIVION"

def test_websocket_ping_pong(client):
    with client.websocket_connect("/ws/test_client") as websocket:
        websocket.receive_json() # consume connect msg
        websocket.send_json({"type": "ping", "timestamp": "now"})
        data = websocket.receive_json()
        assert data["type"] == "pong"

def test_websocket_subscribe(client):
    with client.websocket_connect("/ws/test_client") as websocket:
        websocket.receive_json()
        websocket.send_json({"type": "subscribe", "events": ["agent_started"]})
        data = websocket.receive_json()
        assert data["type"] == "subscribed"
        assert "agent_started" in data["events"]

def test_websocket_unsubscribe(client):
    with client.websocket_connect("/ws/test_client") as websocket:
        websocket.receive_json()
        websocket.send_json({"type": "subscribe", "events": ["agent_started"]})
        websocket.receive_json()
        websocket.send_json({"type": "unsubscribe", "events": ["agent_started"]})
        data = websocket.receive_json()
        assert data["type"] == "unsubscribed"
        assert "agent_started" in data["events"]

@pytest.mark.asyncio
async def test_manager_connect(manager):
    class MockWS:
        async def accept(self): pass
        async def send_json(self, data): pass
    ws = MockWS()
    await manager.connect(ws, "test_client")
    assert "test_client" in manager.active_connections

@pytest.mark.asyncio
async def test_manager_disconnect(manager):
    class MockWS:
        async def accept(self): pass
        async def send_json(self, data): pass
    ws = MockWS()
    await manager.connect(ws, "test_client")
    manager.disconnect("test_client")
    assert "test_client" not in manager.active_connections

@pytest.mark.asyncio
async def test_manager_broadcast(manager):
    class MockWS:
        def __init__(self):
            self.sent = []
        async def accept(self): pass
        async def send_json(self, data):
            self.sent.append(data)
    
    ws1 = MockWS()
    ws2 = MockWS()
    
    await manager.connect(ws1, "c1")
    await manager.connect(ws2, "c2")
    
    manager.subscribe("c1", "test_event")
    manager.subscribe("c2", "test_event")
    
    await manager.broadcast("test_event", {"msg": "hello"})
    assert len(ws1.sent) == 1
    assert len(ws2.sent) == 1
    assert ws1.sent[0]["type"] == "test_event"

@pytest.mark.asyncio
async def test_manager_broadcast_filtered(manager):
    class MockWS:
        def __init__(self):
            self.sent = []
        async def accept(self): pass
        async def send_json(self, data):
            self.sent.append(data)
    
    ws1 = MockWS()
    ws2 = MockWS()
    
    await manager.connect(ws1, "c1")
    await manager.connect(ws2, "c2")
    
    manager.subscribe("c1", "event_A")
    manager.subscribe("c2", "event_B")
    
    await manager.broadcast("event_A", {"msg": "hello"})
    assert len(ws1.sent) == 1
    assert len(ws2.sent) == 0

@pytest.mark.asyncio
async def test_manager_reconnect_queue(manager):
    class MockWS:
        def __init__(self):
            self.sent = []
        async def accept(self): pass
        async def send_json(self, data):
            self.sent.append(data)
            
    ws1 = MockWS()
    await manager.connect(ws1, "c1")
    manager.subscribe("c1", "event_A")
    
    # simulate disconnect without cleanup
    manager.active_connections.pop("c1")
    manager.disconnected_clients["c1"] = True
    
    await manager.broadcast("event_A", {"msg": "missed"})
    
    assert len(manager.message_queue["c1"]) == 1
    
    ws2 = MockWS()
    await manager.connect(ws2, "c1")
    assert len(ws2.sent) == 1
    assert ws2.sent[0]["type"] == "event_A"
    assert "c1" not in manager.message_queue

def test_websocket_invalid_message(client):
    with client.websocket_connect("/ws/test_client") as websocket:
        websocket.receive_json()
        websocket.send_text("invalid json")
        # Should not crash, might send error or ignore
        pass
