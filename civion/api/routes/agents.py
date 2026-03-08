"""Agent API routes."""
from fastapi import APIRouter, HTTPException
from civion.engine.agent_engine import agent_engine
from civion.services.data_service import data_service
from typing import Dict, Any, List
import time

router = APIRouter(prefix="/agents", tags=["Agents"])

def map_agent_to_frontend_type(agent_dict: Dict[str, Any]) -> Dict[str, Any]:
    """Map the backend agent dict to the frontend Agent type."""
    # map internal state to frontend status
    state = agent_dict.get("state", "idle")
    status = "stopped"
    if agent_dict.get("running"):
        status = "running"
    if state == "error":
        status = "error"
    elif state == "paused":
        status = "paused"
        
    return {
        "id": agent_dict.get("name"),
        "name": agent_dict.get("name"),
        "type": "analysis", # Default type or extract if available
        "status": status,
        "last_active": agent_dict.get("last_run") or "",
        "signals_found": agent_dict.get("total_signals", 0),
        "current_task": agent_dict.get("description", ""),
        "uptime_seconds": agent_dict.get("uptime_seconds", 0)
    }

@router.get("")
async def list_agents():
    """List all registered agents with status."""
    raw_agents = agent_engine.list_agents()
    return [map_agent_to_frontend_type(a) for a in raw_agents]

@router.get("/{id}")
async def get_agent(id: str):
    """Get agent details."""
    agent = agent_engine.get_agent(id)
    if not agent:
        raise HTTPException(404, f"Agent '{id}' not found")
    return map_agent_to_frontend_type(agent.to_dict())

@router.post("/{id}/start")
async def start_agent(id: str):
    """Start an agent."""
    return await agent_engine.start_agent(id)

@router.post("/{id}/stop")
async def stop_agent(id: str):
    """Stop an agent."""
    return await agent_engine.stop_agent(id)

@router.post("/{id}/restart")
async def restart_agent(id: str):
    """Restart an agent."""
    return await agent_engine.restart_agent(id)

@router.post("/{id}/pause")
async def pause_agent(id: str):
    """Pause an agent."""
    return await agent_engine.pause_agent(id)

@router.post("/{id}/resume")
async def resume_agent(id: str):
    """Resume an agent."""
    return await agent_engine.resume_agent(id)

@router.post("/{id}/run")
async def run_agent(id: str):
    """Run a single scan cycle for an agent."""
    return await agent_engine.run_agent_cycle(id)

@router.get("/{id}/logs")
async def agent_logs(id: str):
    """Get agent activity logs."""
    return await data_service.get_agent_logs(id)

@router.post("/run-all")
async def run_all_agents():
    """Run all agents concurrently."""
    return await agent_engine.run_all_agents()
