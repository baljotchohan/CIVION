"""Agent API routes."""
from fastapi import APIRouter, HTTPException
from civion.engine.agent_engine import agent_engine
from civion.services.data_service import data_service

router = APIRouter(prefix="/agents", tags=["Agents"])


@router.get("")
async def list_agents():
    """List all registered agents with status."""
    return agent_engine.list_agents()


@router.get("/{agent_name}")
async def get_agent(agent_name: str):
    """Get agent details."""
    agent = agent_engine.get_agent(agent_name)
    if not agent:
        raise HTTPException(404, f"Agent '{agent_name}' not found")
    return agent.to_dict()


@router.post("/{agent_name}/start")
async def start_agent(agent_name: str):
    """Start an agent."""
    return await agent_engine.start_agent(agent_name)


@router.post("/{agent_name}/stop")
async def stop_agent(agent_name: str):
    """Stop an agent."""
    return await agent_engine.stop_agent(agent_name)


@router.post("/{agent_name}/restart")
async def restart_agent(agent_name: str):
    """Restart an agent."""
    return await agent_engine.restart_agent(agent_name)


@router.post("/{agent_name}/run")
async def run_agent(agent_name: str):
    """Run a single scan cycle for an agent."""
    return await agent_engine.run_agent_cycle(agent_name)


@router.get("/{agent_name}/logs")
async def agent_logs(agent_name: str):
    """Get agent activity logs."""
    return await data_service.get_agent_logs(agent_name)


@router.post("/run-all")
async def run_all_agents():
    """Run all agents concurrently."""
    return await agent_engine.run_all_agents()
