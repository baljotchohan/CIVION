import pytest
import json
from fastapi.testclient import TestClient
from civion.api.server import app
from civion.api.websocket import manager
import asyncio

client = TestClient(app)

def test_websocket_connection():
    """Test WebSocket connection"""
    with client.websocket_connect("/ws") as websocket:
        # Receive connection confirmation
        data = websocket.receive_json()
        assert data["type"] == "connected"
        assert "event_id" in data

@pytest.mark.asyncio
async def test_websocket_broadcast():
    """Test broadcasting events"""
    # Note: TestClient doesn't support async broadcast easily in the same process/thread
    # but we can test the manager directly
    
    # Mock a websocket connection
    class MockWebSocket:
        def __init__(self):
            self.sent_messages = []
            self.closed = False
        async def accept(self): pass
        async def send_json(self, data):
            self.sent_messages.append(data)
        async def close(self):
            self.closed = True

    mock_ws = MockWebSocket()
    await manager.connect(mock_ws)
    
    test_data = {"message": "hello"}
    await manager.broadcast("test_event", test_data)
    
    assert len(mock_ws.sent_messages) >= 2 # 1 for connected, 1 for test_event
    assert mock_ws.sent_messages[1]["type"] == "test_event"
    assert mock_ws.sent_messages[1]["data"] == test_data
    
    manager.disconnect(mock_ws)
