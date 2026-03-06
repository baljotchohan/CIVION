"""
Unit tests for CIVION AgentEngine.
Ensures the engine can load agents, register them, and execute them concurrently.
"""

import pytest

from civion.engine.agent_engine import AgentEngine

@pytest.mark.asyncio
async def test_agent_engine_registration(test_db_path, mock_agent):
    """Test that the engine registers agents correctly into the database."""
    engine = AgentEngine()
    engine.register_agent(mock_agent)
    
    assert mock_agent.name in engine._agents
    
    from civion.storage.database import register_agent_db
    await register_agent_db(mock_agent.name, mock_agent.description, mock_agent.personality, mock_agent.interval, getattr(mock_agent, "tags", []))
    
    import civion.storage.database as db
    stored_agents = await db.get_registered_agents()
    
    assert len(stored_agents) > 0
    assert any(a['name'] == mock_agent.name for a in stored_agents)

@pytest.mark.asyncio
async def test_agent_engine_run_single(test_db_path, mock_agent):
    """Test running a single agent through the engine."""
    engine = AgentEngine()
    engine.register_agent(mock_agent)
    
    result = await engine.run_agent(mock_agent.name)
    assert result is not None
    assert result.success is True
    assert result.title == "Test Run"

@pytest.mark.asyncio
async def test_agent_engine_run_missing(test_db_path):
    """Test running a non-existent agent returns gracefully."""
    engine = AgentEngine()
    result = await engine.run_agent("non_existent_agent")
    assert result is None

@pytest.mark.asyncio
async def test_agent_engine_run_all_concurrent(test_db_path, mock_agent):
    """Test concurrent execution of all agents."""
    engine = AgentEngine()
    engine.register_agent(mock_agent)
    
    # We can fake a second agent
    from copy import copy
    agent_2 = copy(mock_agent)
    agent_2.name = "test_agent_2"
    engine.register_agent(agent_2)
    
    results = await engine.run_all_agents()
    
    assert len(results) == 2
    assert all(r.success is True for r in results)
