import pytest
import asyncio
from unittest.mock import patch, AsyncMock
from civion.engine.reasoning_loop import ReasoningLoop, ReasoningArgument, ReasoningEngine

@pytest.fixture
def engine():
    return ReasoningEngine()

@pytest.fixture
def rl():
    return ReasoningLoop(id="test_id", topic="Test Topic", hypothesis="Test Hypothesis")

@pytest.mark.asyncio
async def test_engine_seeds_mock_on_init(engine):
    """Test that the engine initializes with a mock loop."""
    assert len(engine.loops) == 1
    assert engine.loops[0].topic == "AI Robotics Market Growth"

@pytest.mark.asyncio
async def test_start_reasoning_loop_creates_loop(engine):
    """Test starting a new reasoning loop via engine."""
    with patch("civion.api.websocket.manager.broadcast", new_callable=AsyncMock) as mock_ws:
        loop = await engine.start_reasoning_loop("Accelerating growth", "Market Growth")
        assert loop is not None
        assert loop.topic == "Market Growth"
        assert loop.state == "consensus_reached"
        assert len(loop.arguments) == 4
        # Should broadcast argument_added 4 times + confidence_changed 4 times + completed 1 time
        assert mock_ws.call_count >= 9

@pytest.mark.asyncio
async def test_get_loop_finds_by_id(engine):
    """Test retrieving a loop by its ID."""
    loop_id = engine.loops[0].id
    found = await engine.get_loop(loop_id)
    assert found is not None
    assert found.id == loop_id

@pytest.mark.asyncio
async def test_get_loop_missing_returns_none(engine):
    """Test retrieving non-existent ID returns None."""
    found = await engine.get_loop("missing")
    assert found is None

@pytest.mark.asyncio
async def test_display_reasoning_loop_dict(engine, rl):
    """Test the display/dict method for loop and arguments."""
    data = await engine.display_reasoning_loop(rl)
    assert data["id"] == "test_id"
    assert data["topic"] == "Test Topic"
    assert isinstance(data["arguments"], list)

@pytest.mark.asyncio
async def test_loop_set_active_goal(rl):
    """Test setting active goal on loop."""
    class MockGoal:
        title = "Goal Title"
        def dict(self): return {"title": self.title}
    
    goal = MockGoal()
    rl.set_active_goal(goal)
    assert rl.active_goal == goal
    assert rl.topic == "Goal Title"

@pytest.mark.asyncio
async def test_loop_clear_debate(rl):
    """Test clearing the active goal."""
    rl.active_goal = {"something": "here"}
    rl.clear_debate()
    assert rl.active_goal is None

@pytest.mark.asyncio
async def test_loop_get_state(rl):
    """Test retrieving loop state summary."""
    rl.state = "finished"
    state = rl.get_state()
    assert state["state"] == "finished"
    assert state["active_goal"] == rl.active_goal

@pytest.mark.asyncio
async def test_reasoning_argument_serialization():
    """Test ReasoningArgument.dict() mapping."""
    arg = ReasoningArgument(agent="AgentA", position="challenge", argument="No", confidence=0.2)
    d = arg.dict()
    assert d["agent"] == "AgentA"
    assert d["position"] == "challenge"
    assert d["confidence"] == 0.2

@pytest.mark.asyncio
async def test_start_reasoning_loop_calculates_consensus(engine):
    """Test consensus calculation logic in the engine."""
    with patch("civion.api.websocket.manager.broadcast", new_callable=AsyncMock):
        loop = await engine.start_reasoning_loop("insight", "topic")
        assert "consensus_reached" == loop.state
        assert isinstance(loop.final_confidence, float)
        assert loop.consensus != ""

@pytest.mark.asyncio
async def test_loop_run_cycle_is_nop(rl):
    """Test that run_cycle returns None as implemented."""
    res = await rl.run_cycle()
    assert res is None

@pytest.mark.asyncio
async def test_loop_dict_with_complex_goal(rl):
    """Test loop serialization when goal has its own dict method."""
    class Goal:
        def dict(self): return {"key": "val"}
    rl.active_goal = Goal()
    data = rl.dict()
    assert data["active_goal"] == {"key": "val"}
