import pytest
from civion.engine.reasoning_loop import reasoning_engine

@pytest.mark.asyncio
async def test_reasoning_loop():
    insight = "AI Robotics accelerating"
    topic = "AI Robotics"
    loop = await reasoning_engine.start_reasoning_loop(insight, topic)
    
    assert loop.id is not None
    assert loop.topic == topic
    assert loop.hypothesis == insight
    
    # Check that arguments were gathered (mocked)
    assert len(loop.arguments) > 1
    
    # Check that consensus was reached
    assert loop.consensus != ""
    assert loop.final_confidence > 0.5
