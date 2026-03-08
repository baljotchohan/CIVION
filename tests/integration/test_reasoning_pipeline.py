import pytest
import asyncio
from unittest.mock import patch, AsyncMock
from civion.engine.reasoning_loop import ReasoningEngine, ReasoningLoop

@pytest.fixture
def engine():
    return ReasoningEngine()

@pytest.mark.asyncio
async def test_pipeline_seed_loop_present(engine):
    """Verify the default seeded reasoning loop exists in the pipeline."""
    assert len(engine.loops) > 0
    assert engine.loops[0].topic == "AI Robotics Market Growth"

@pytest.mark.asyncio
async def test_pipeline_start_loop_broadcasts_events(engine):
    """Test that starting a loop broadcasts multiple stages to WS."""
    with patch("civion.api.websocket.manager.broadcast", new_callable=AsyncMock) as mock_ws:
        await engine.start_reasoning_loop("New insight", "New Topic")
        # Should have multiple broadcasts for arguments and completion
        assert mock_ws.call_count >= 5
        calls = [call.args[0] for call in mock_ws.call_args_list]
        assert "reasoning_updated" in calls
        assert "confidence_changed" in calls

@pytest.mark.asyncio
async def test_pipeline_consensus_logic(engine):
    """Test the consensus calculation in a full reasoning cycle."""
    with patch("civion.api.websocket.manager.broadcast", new_callable=AsyncMock):
        loop = await engine.start_reasoning_loop("insight", "topic")
        assert loop.state == "consensus_reached"
        assert loop.final_confidence >= 0.5
        assert len(loop.arguments) == 4

@pytest.mark.asyncio
async def test_pipeline_websocket_payload_integrity(engine):
    """Validate the data structure sent over WebSockets during reasoning."""
    with patch("civion.api.websocket.manager.broadcast", new_callable=AsyncMock) as mock_ws:
        await engine.start_reasoning_loop("test", "test")
        # Check specifically the 'completed' payload
        completed_call = [c for c in mock_ws.call_args_list if c.args[1].get("stage") == "completed"][0]
        data = completed_call.args[1]["data"]
        assert data["topic"] == "test"
        assert "arguments" in data
        assert "consensus" in data

@pytest.mark.asyncio
async def test_pipeline_get_loop_integration(engine):
    """Test retrieving loop from engine state."""
    new_loop = await engine.start_reasoning_loop("data", "topic")
    found = await engine.get_loop(new_loop.id)
    assert found.id == new_loop.id
    assert found.topic == "topic"

@pytest.mark.asyncio
async def test_pipeline_confidence_broadcast_details(engine):
    """Verify confidence change broadcast content."""
    with patch("civion.api.websocket.manager.broadcast", new_callable=AsyncMock) as mock_ws:
        await engine.start_reasoning_loop("insight", "topic")
        conf_call = [c for c in mock_ws.call_args_list if c.args[0] == "confidence_changed"][0]
        payload = conf_call.args[1]
        assert "confidence" in payload
        assert "agent" in payload
        assert "timestamp" in payload

@pytest.mark.asyncio
async def test_pipeline_multiple_concurrent_loops(engine):
    """Ensure the engine handles multiple reasoning loops correctly."""
    with patch("civion.api.websocket.manager.broadcast", new_callable=AsyncMock):
        tasks = [
            engine.start_reasoning_loop(f"insight {i}", f"topic {i}") 
            for i in range(3)
        ]
        results = await asyncio.gather(*tasks)
        assert len(results) == 3
        assert len(engine.loops) >= 4  # 1 seeded + 3 new

@pytest.mark.asyncio
async def test_pipeline_loop_serialization_completeness(engine):
    """Test that engine can display/serialize loops fully."""
    loop = engine.loops[0]
    data = await engine.display_reasoning_loop(loop)
    assert "arguments" in data
    assert len(data["arguments"]) == 4
    assert data["state"] == "consensus_reached"

@pytest.mark.asyncio
async def test_pipeline_delay_simulation(engine):
    """Ensure the engine respects async sleep during reasoning loop."""
    with patch("civion.api.websocket.manager.broadcast", new_callable=AsyncMock):
        start_time = asyncio.get_event_loop().time()
        await engine.start_reasoning_loop("insight", "topic")
        end_time = asyncio.get_event_loop().time()
        # 4 agents * 0.5s delay = ~2s
        assert end_time - start_time >= 1.5

@pytest.mark.asyncio
async def test_pipeline_loop_creation_timestamp(engine):
    """Verify that new loops have a created_at timestamp."""
    loop = await engine.start_reasoning_loop("insight", "topic")
    assert loop.created_at != ""
    assert "T" in loop.created_at
