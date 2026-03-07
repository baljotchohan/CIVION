"""
Unit tests for CIVION Agent Scheduler.
"""

import pytest

from civion.engine.scheduler import AgentScheduler
from civion.engine.agent_engine import AgentController

@pytest.mark.asyncio
async def test_scheduler_starts_and_stops():
    """Test basic scheduler initialization."""
    engine = AgentController()
    scheduler = AgentScheduler(engine)
    
    # Default is not running
    assert scheduler._scheduler.running is False
    
    # Start it
    scheduler.start()
    assert scheduler._scheduler.running is True
    
    # Shut it down
    try:
        scheduler.stop()
    except Exception as e:
        pytest.fail(f"Scheduler failed to stop: {e}")

@pytest.mark.asyncio
async def test_scheduler_schedules_agents(mock_agent):
    """Test that all agents in the engine are added as jobs."""
    engine = AgentController()
    engine.register_agent(mock_agent)
    
    scheduler = AgentScheduler(engine)
    scheduler.schedule_agents()
    
    jobs = scheduler._scheduler.get_jobs()
    assert len(jobs) == 1
    assert jobs[0].id == f"civion_{mock_agent.name}"
