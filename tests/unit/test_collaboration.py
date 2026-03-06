"""
Unit tests for CIVION CollaborationEngine.
"""

import pytest
from civion.engine.collaboration_engine import generate_signals

@pytest.mark.asyncio
async def test_collaboration_generate_signals(test_db_path, mock_llm):
    """Test generating a signal from multiple agent results."""
    # Let's setup a valid mocked JSON response from the LLM
    mock_llm.fixed_response = '''
    [
        {
            "title": "Cross-domain AI integration",
            "description": "Both agents mention AI frameworks",
            "confidence": 0.85,
            "agents_involved": ["agent1", "agent2"]
        }
    ]
    '''
    
    agent_data = [
        {"agent_name": "agent1", "title": "AI in Finance", "content": "AI is taking over Wall St."},
        {"agent_name": "agent2", "title": "AI in Startups", "content": "Many startups use AI."}
    ]
    
    signals = await generate_signals(agent_data)
    
    assert len(signals) == 1
    assert signals[0]["title"] == "Cross-domain AI integration"
    assert signals[0]["confidence"] == 0.85
    
    # Verify it saved to DB
    import civion.storage.database as db
    # We can check memory nodes or just verify the function executed correctly
    # actually, save_collaboration_signal doesn't exist? Oh wait, it's inserted into collaboration_signals table
    # in generate_signals.
    # Let's query db directly
    cursor = await db._fetch_all("SELECT * FROM collaboration_signals")
    assert len(cursor) == 1
    assert cursor[0]["title"] == "Cross-domain AI integration"

@pytest.mark.asyncio
async def test_collaboration_fallback_signal(test_db_path, mock_llm):
    """Test generating a fallback signal when LLM throws Exception."""
    # Force an exception context by setting an invalid response
    mock_llm.fixed_response = 'invalid json data'
    
    agent_data = [
        {"agent_name": "agent1", "title": "AI in Finance", "content": "Alone."}
    ]
    
    signals = await generate_signals(agent_data)
    
    assert len(signals) == 1
    assert signals[0]["title"] == "Agent Sweep Complete"
    assert signals[0]["confidence"] == 0.5
