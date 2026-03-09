"""Agent API routes."""
from fastapi import APIRouter, HTTPException
from civion.engine.agent_engine import agent_engine
from civion.services.data_service import data_service
from pathlib import Path
from typing import Dict, Any, List
import time

router = APIRouter(prefix="/agents", tags=["Agents"])

# Use the global agent_engine singleton

def map_agent_to_frontend_type(agent: Any) -> Dict[str, Any]:
    """Map the backend agent object to the frontend Agent type."""
    # Handle dict (from older implementation) or object
    if isinstance(agent, dict):
        agent_dict = agent
        state = agent_dict.get("state", "idle")
        status = "stopped"
        if agent_dict.get("running"):
            status = "running"
        if state == "error":
            status = "error"
        elif state == "paused":
            status = "paused"
            
        return {
            "id": agent_dict.get("name", "unknown"),
            "name": agent_dict.get("name", "Unknown Agent"),
            "type": "analysis",
            "status": status,
            "last_active": agent_dict.get("last_run", ""),
            "signals_found": agent_dict.get("total_signals", 0),
            "current_task": agent_dict.get("description", ""),
            "uptime_seconds": agent_dict.get("uptime_seconds", 0)
        }
    else:
        # It's an Agent object from controller
        state = getattr(agent, "state", "idle")
        status = "stopped"
        if getattr(agent, "is_running", False):
            status = "running"
        if state == "error":
            status = "error"
        elif state == "paused":
            status = "paused"
            
        return {
            "id": getattr(agent, "id", getattr(agent, "name", "unknown")),
            "name": getattr(agent, "name", "Unknown Agent"),
            "type": getattr(agent, "agent_type", "analysis"),
            "status": status,
            "last_active": str(getattr(agent, "last_active", time.time())),
            "signals_found": getattr(agent, "signals_found", 0),
            "current_task": getattr(agent, "current_task", "Idle"),
            "uptime_seconds": int(time.time() - getattr(agent, "start_time")) if getattr(agent, "is_running", False) else 0
        }

@router.get("")
async def list_agents():
    """List all registered agents with real status via AgentEngine."""
    agents = agent_engine.list_agents()
    return agents

@router.get("/{id}")
async def get_agent(id: str):
    """Get agent details."""
    agent = agent_engine.get_agent(id)
    if not agent:
        raise HTTPException(404, f"Agent '{id}' not found")
    return agent.to_dict()

@router.post("/{id}/start")
async def start_agent(id: str):
    """Start an agent via engine."""
    try:
        await agent_engine.start_agent(id)
        return {"status": "success", "message": f"Agent {id} started"}
    except Exception as e:
        raise HTTPException(500, str(e))

@router.post("/{id}/stop")
async def stop_agent(id: str):
    """Stop an agent via engine."""
    try:
        await agent_engine.stop_agent(id)
        return {"status": "success", "message": f"Agent {id} stopped"}
    except Exception as e:
        raise HTTPException(500, str(e))

@router.post("/{id}/restart")
async def restart_agent(id: str):
    """Restart an agent."""
    try:
        await agent_engine.stop_agent(id)
        await agent_engine.start_agent(id)
        return {"status": "success", "message": f"Agent {id} restarted"}
    except Exception as e:
        raise HTTPException(500, str(e))

@router.get("/{id}/logs")
async def agent_logs(id: str):
    """Get real agent logs from ~/.civion/logs/agents/{id}.log"""
    try:
        log_path = Path.home() / ".civion" / "logs" / "agents" / f"{id}.log"
        if not log_path.exists():
            return []
        
        with open(log_path, "r", encoding="utf-8") as f:
            lines = f.readlines()
            
        # Return last 100 lines
        return [line.strip() for line in lines[-100:] if line.strip()]
    except Exception as e:
        return [f"Error reading logs: {str(e)}"]

@router.post("/run-all")
async def run_all_agents():
    """Run all agents concurrently."""
    try:
        await agent_engine.start_all()
        return {"status": "success", "message": "All agents started"}
    except Exception as e:
        raise HTTPException(500, str(e))
