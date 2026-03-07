import pytest
import asyncio
from civion.engine.agent_controller import agent_controller, AgentStatus

@pytest.mark.asyncio
async def test_agent_controller_lifecycle():
    """Test agent lifecycle via controller"""
    agent_name = "test_agent"
    
    # Start
    result = await agent_controller.start_agent(agent_name)
    assert result["success"] is True
    assert result["status"] == "running"
    
    status = agent_controller.get_status(agent_name)
    assert status["status"] == "running"
    
    # Pause
    result = await agent_controller.pause_agent(agent_name)
    assert result["success"] is True
    assert result["status"] == "paused"
    
    # Resume
    result = await agent_controller.resume_agent(agent_name)
    assert result["success"] is True
    assert result["status"] == "running"
    
    # Stop
    result = await agent_controller.stop_agent(agent_name)
    assert result["success"] is True
    assert result["status"] == "stopped"
    
    status = agent_controller.get_status(agent_name)
    assert status["status"] == "stopped"

@pytest.mark.asyncio
async def test_agent_controller_restart():
    """Test agent restart"""
    agent_name = "restart_agent"
    
    await agent_controller.start_agent(agent_name)
    result = await agent_controller.restart_agent(agent_name)
    
    assert result["success"] is True
    assert result["status"] == "running"
    
    status = agent_controller.get_status(agent_name)
    assert status["run_count"] == 0 # It resets if we use the prompt's implementation strictly
