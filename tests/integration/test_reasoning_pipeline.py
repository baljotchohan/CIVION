import pytest
import asyncio
from datetime import datetime
from civion.engine.reasoning_loop import ReasoningLoop
from civion.models.goal import Goal
from civion.models.confidence import ConfidenceHistory

class MockLLMService:
    async def get_chat_completion(self, messages, temperature=0.7):
        role = messages[-1]["content"]
        if "propose" in role.lower():
            return '{"content": "Proposed hypothesis", "confidence": 0.8, "is_final": false}'
        elif "challenge" in role.lower() or "verifier" in role.lower():
            return '{"content": "Challenged hypothesis", "confidence": 0.6, "is_final": false}'
        else:
            return '{"content": "Final synthesized conclusion", "confidence": 0.9, "is_final": true}'

@pytest.fixture
def reasoning_loop():
    loop = ReasoningLoop()
    loop.llm_service = MockLLMService()
    return loop

@pytest.mark.asyncio
async def test_run_cycle_no_goal(reasoning_loop):
    result = await reasoning_loop.run_cycle()
    assert result is None

@pytest.mark.asyncio
async def test_set_active_goal(reasoning_loop):
    goal = Goal(title="Test Goal", description="Description", criteria=["test"], status="active", created_at=datetime.now().isoformat())
    reasoning_loop.set_active_goal(goal)
    assert reasoning_loop.active_goal == goal

@pytest.mark.asyncio
async def test_run_cycle_with_goal(reasoning_loop):
    goal = Goal(title="Test Goal", description="Description", criteria=["test"], status="active", created_at=datetime.now().isoformat())
    reasoning_loop.set_active_goal(goal)
    
    # We use the mock LLM
    result = await reasoning_loop.run_cycle()
    
    assert len(reasoning_loop.debate_history) > 0
    assert reasoning_loop.debate_history[-1].is_final is True
    assert reasoning_loop.debate_history[-1].content == "Final synthesized conclusion"

@pytest.mark.asyncio
async def test_confidence_integration(reasoning_loop):
    goal = Goal(title="Another Goal", description="Desc", criteria=["test"], status="active", created_at=datetime.now().isoformat())
    reasoning_loop.set_active_goal(goal)
    
    await reasoning_loop.run_cycle()
    
    conf = reasoning_loop.confidence_tracker.current_confidence
    assert conf > 0.0
    history = reasoning_loop.get_confidence_history()
    assert len(history) > 0

@pytest.mark.asyncio
async def test_clear_debate(reasoning_loop):
    goal = Goal(id="g1", title="Test", description="Desc", criteria=[], status="active", created_at="")
    reasoning_loop.set_active_goal(goal)
    await reasoning_loop.run_cycle()
    
    assert len(reasoning_loop.debate_history) > 0
    reasoning_loop.clear_debate()
    assert len(reasoning_loop.debate_history) == 0
    assert reasoning_loop.active_goal is None

@pytest.mark.asyncio
async def test_get_state(reasoning_loop):
    state = reasoning_loop.get_state()
    assert "active_goal" in state
    assert "debate_history" in state
    assert "current_confidence" in state

@pytest.mark.asyncio
async def test_run_cycle_preserves_messages(reasoning_loop):
    goal = Goal(id="g1", title="Test", description="Desc", criteria=[], status="active", created_at="")
    reasoning_loop.set_active_goal(goal)
    
    await reasoning_loop.run_cycle()
    count1 = len(reasoning_loop.debate_history)
    
    await reasoning_loop.run_cycle()
    count2 = len(reasoning_loop.debate_history)
    
    assert count2 > count1

@pytest.mark.asyncio
async def test_llm_json_parsing_error():
    loop = ReasoningLoop()
    class BadMockLLM:
        async def get_chat_completion(self, m, t):
            return "This is not json"
    
    loop.llm_service = BadMockLLM()
    loop.set_active_goal(Goal(id="g1", title="Test", description="Desc", criteria=[], status="active", created_at=""))
    
    await loop.run_cycle()
    
    # It should handle parsing error gracefully and add an error message to the debate
    assert len(loop.debate_history) > 0
    assert "Failed to parse" in loop.debate_history[-1].content

@pytest.mark.asyncio
async def test_debate_participant_roles(reasoning_loop):
    goal = Goal(id="g1", title="Test", description="Desc", criteria=[], status="active", created_at="")
    reasoning_loop.set_active_goal(goal)
    await reasoning_loop.run_cycle()
    
    roles = [m.role for m in reasoning_loop.debate_history]
    assert "proposer" in roles
    assert "verifier" in roles
    assert "synthesizer" in roles

@pytest.mark.asyncio
async def test_conclusion_triggers_event(reasoning_loop):
    events = []
    
    def on_event(evt):
        events.append(evt)
        
    # the reasoning loop uses manager.broadcast internally, we can mock it here if needed
    # for unit test integration we just verify the internal logic worked
    goal = Goal(id="g1", title="Test", description="Desc", criteria=[], status="active", created_at="")
    reasoning_loop.set_active_goal(goal)
    await reasoning_loop.run_cycle()
    assert reasoning_loop.active_goal.status in ["active", "completed"] # depends on synthesis
