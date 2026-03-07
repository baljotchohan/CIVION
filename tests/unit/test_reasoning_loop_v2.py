import pytest
from civion.engine.reasoning_loop import ReasoningEngine, ReasoningLoop
from civion.api.websocket import manager
import asyncio

@pytest.mark.asyncio
async def test_reasoning_loop_broadcasting():
    """Test that reasoning loop broadcasts events"""
    engine = ReasoningEngine()
    
    # Mock a websocket connection to capture broadcasts
    class MockWebSocket:
        def __init__(self):
            self.sent_messages = []
        async def accept(self): pass
        async def send_json(self, data):
            self.sent_messages.append(data)
    
    mock_ws = MockWebSocket()
    await manager.connect(mock_ws)
    
    # Clear "connected" message
    mock_ws.sent_messages = []
    
    # Start loop
    await engine.start_reasoning_loop("test insight", "test topic")
    
    # We expect several messages: arguments added, confidence changed, and completed
    assert len(mock_ws.sent_messages) > 0
    
    types = [m["type"] for m in mock_ws.sent_messages]
    assert "reasoning_updated" in types
    assert "confidence_changed" in types
    
    # Find completion message
    completion = next((m for m in mock_ws.sent_messages if m["type"] == "reasoning_updated" and m["data"].get("stage") == "completed"), None)
    assert completion is not None
    assert completion["data"]["data"]["topic"] == "test topic"
    
    manager.disconnect(mock_ws)
