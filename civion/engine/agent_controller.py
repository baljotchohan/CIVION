import asyncio
from datetime import datetime
from enum import Enum
from typing import Dict, Optional, List
import uuid

class AgentStatus(str, Enum):
    IDLE = "idle"
    RUNNING = "running"
    PAUSED = "paused"
    ERROR = "error"
    STOPPED = "stopped"

class AgentInstance:
    def __init__(self, agent_name: str):
        self.agent_name = agent_name
        self.status = AgentStatus.IDLE
        self.started_at: Optional[datetime] = None
        self.last_run = datetime.now()
        self.run_count = 0
        self.error_count = 0
        self.last_error = ""
        self.task: Optional[asyncio.Task] = None
    
    def to_dict(self) -> dict:
        return {
            "agent_name": self.agent_name,
            "status": self.status.value,
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "last_run": self.last_run.isoformat(),
            "run_count": self.run_count,
            "error_count": self.error_count,
            "last_error": self.last_error,
            "uptime_seconds": (datetime.now() - self.started_at).total_seconds() if self.started_at else 0
        }

class AgentController:
    """Manages agent lifecycle and coordination"""
    
    def __init__(self):
        self._instances: Dict[str, AgentInstance] = {}
        self._running_agents: Dict[str, asyncio.Task] = {}
    
    async def start_agent(self, agent_name: str) -> dict:
        """Start an agent"""
        if agent_name not in self._instances:
            self._instances[agent_name] = AgentInstance(agent_name)
        
        instance = self._instances[agent_name]
        
        if instance.status in [AgentStatus.RUNNING, AgentStatus.PAUSED]:
            return {
                "success": False,
                "error": f"Agent {agent_name} is already {instance.status.value}"
            }
        
        instance.status = AgentStatus.RUNNING
        instance.started_at = datetime.now()
        
        # Broadcast event
        from civion.api.websocket import manager
        await manager.broadcast("agent_started", {
            "agent": agent_name,
            "timestamp": datetime.now().isoformat()
        })
        
        return {
            "success": True,
            "agent": agent_name,
            "status": instance.status.value
        }
    
    async def stop_agent(self, agent_name: str) -> dict:
        """Stop an agent"""
        if agent_name not in self._instances:
            return {
                "success": False,
                "error": f"Agent {agent_name} not found"
            }
        
        instance = self._instances[agent_name]
        instance.status = AgentStatus.STOPPED
        instance.started_at = None
        
        # Broadcast event
        from civion.api.websocket import manager
        await manager.broadcast("agent_stopped", {
            "agent": agent_name,
            "timestamp": datetime.now().isoformat()
        })
        
        return {
            "success": True,
            "agent": agent_name,
            "status": instance.status.value
        }
    
    async def pause_agent(self, agent_name: str) -> dict:
        """Pause an agent"""
        if agent_name not in self._instances:
            return {"success": False, "error": f"Agent {agent_name} not found"}
        
        self._instances[agent_name].status = AgentStatus.PAUSED
        return {"success": True, "agent": agent_name, "status": "paused"}
    
    async def resume_agent(self, agent_name: str) -> dict:
        """Resume an agent"""
        if agent_name not in self._instances:
            return {"success": False, "error": f"Agent {agent_name} not found"}
        
        self._instances[agent_name].status = AgentStatus.RUNNING
        return {"success": True, "agent": agent_name, "status": "running"}
    
    async def restart_agent(self, agent_name: str) -> dict:
        """Restart an agent"""
        await self.stop_agent(agent_name)
        await asyncio.sleep(0.5)
        return await self.start_agent(agent_name)
    
    def get_status(self, agent_name: str) -> dict:
        """Get agent status"""
        if agent_name not in self._instances:
            return {"status": "not_found", "agent": agent_name}
        
        return self._instances[agent_name].to_dict()
    
    def list_all_status(self) -> list:
        """List all agents status"""
        return [instance.to_dict() for instance in self._instances.values()]

# Global instance
agent_controller = AgentController()
