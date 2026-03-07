"""
CIVION Agent Engine
Orchestrates all agents and manages concurrent execution.
"""
from __future__ import annotations
import asyncio
from datetime import datetime
from typing import Any, Dict, List, Optional
from civion.core.constants import AgentState, DEFAULT_AGENTS
from civion.core.logger import engine_logger
from civion.agents.base_agent import BaseAgent
from civion.api.websocket import manager

log = engine_logger("agent_engine")


class AgentEngine:
    """Central orchestrator for all CIVION agents."""

    def __init__(self):
        self._agents: Dict[str, BaseAgent] = {}
        self._running_tasks: Dict[str, asyncio.Task] = {}

    def register(self, agent: BaseAgent) -> None:
        """Register an agent."""
        self._agents[agent.name] = agent
        log.info(f"Agent registered: {agent.name}")

    def get_agent(self, name: str) -> Optional[BaseAgent]:
        return self._agents.get(name)

    async def start_agent(self, name: str) -> Dict[str, Any]:
        """Start a specific agent."""
        agent = self._agents.get(name)
        if not agent:
            return {"error": f"Agent '{name}' not found"}
        
        if agent.is_running:
            return {"status": "already_running", "agent": name}
            
        await agent.start()
        
        # Broadcast event
        await manager.broadcast("agent_started", {
            "agent": name,
            "timestamp": datetime.now().isoformat()
        })
        
        return {"status": "started", "agent": name}

    async def stop_agent(self, name: str) -> Dict[str, Any]:
        """Stop a specific agent."""
        agent = self._agents.get(name)
        if not agent:
            return {"error": f"Agent '{name}' not found"}
            
        await agent.stop()
        if name in self._running_tasks:
            self._running_tasks[name].cancel()
            del self._running_tasks[name]
            
        # Broadcast event
        await manager.broadcast("agent_stopped", {
            "agent": name,
            "timestamp": datetime.now().isoformat()
        })
        
        return {"status": "stopped", "agent": name}

    async def pause_agent(self, name: str) -> Dict[str, Any]:
        """Pause a specific agent."""
        agent = self._agents.get(name)
        if not agent:
            return {"error": f"Agent '{name}' not found"}
        
        agent.state = AgentState.IDLE # Or add a PAUSED state to AgentState
        agent._running = False
        
        await manager.broadcast("agent_paused", {
            "agent": name,
            "timestamp": datetime.now().isoformat()
        })
        
        return {"status": "paused", "agent": name}

    async def resume_agent(self, name: str) -> Dict[str, Any]:
        """Resume a specific agent."""
        agent = self._agents.get(name)
        if not agent:
            return {"error": f"Agent '{name}' not found"}
        
        agent._running = True
        
        await manager.broadcast("agent_resumed", {
            "agent": name,
            "timestamp": datetime.now().isoformat()
        })
        
        return {"status": "running", "agent": name}

    async def restart_agent(self, name: str) -> Dict[str, Any]:
        """Restart a specific agent."""
        await self.stop_agent(name)
        return await self.start_agent(name)

    async def run_agent_cycle(self, name: str) -> Dict[str, Any]:
        """Run a single scan cycle for an agent."""
        agent = self._agents.get(name)
        if not agent:
            return {"error": f"Agent '{name}' not found"}
        result = await agent.run_cycle()
        return {
            "agent": name,
            "insights": len(result.insights),
            "signals": len(result.signals),
            "errors": result.errors,
            "duration": result.duration_seconds,
        }

    async def run_all_agents(self) -> List[Dict[str, Any]]:
        """Run all agents concurrently."""
        log.info("Running all agents...")
        tasks = [
            self.run_agent_cycle(name)
            for name in self._agents
        ]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        return [r if isinstance(r, dict) else {"error": str(r)} for r in results]

    async def start_all(self) -> None:
        """Start all registered agents."""
        for agent in self._agents.values():
            await agent.start()
        log.info(f"All {len(self._agents)} agents started")

    async def stop_all(self) -> None:
        """Stop all running agents."""
        for agent in self._agents.values():
            await agent.stop()
        for task in self._running_tasks.values():
            task.cancel()
        self._running_tasks.clear()
        log.info("All agents stopped")

    def list_agents(self) -> List[Dict[str, Any]]:
        """List all agents with status."""
        return [agent.to_dict() for agent in self._agents.values()]

    def get_agent_logs(self, name: str) -> List[str]:
        """Get logs for a specific agent."""
        agent = self._agents.get(name)
        if not agent:
            return [f"Agent '{name}' not found"]
        return [f"Agent: {name}, State: {agent.state.value}, Scans: {agent._scan_count}"]

    @property
    def active_count(self) -> int:
        return sum(1 for a in self._agents.values() if a.is_running)

    @property
    def total_count(self) -> int:
        return len(self._agents)

    def get_stats(self) -> Dict[str, Any]:
        return {
            "total": self.total_count,
            "active": self.active_count,
            "agents": {name: agent.state.value for name, agent in self._agents.items()},
        }


# Singleton
agent_engine = AgentEngine()


def register_default_agents():
    """Register all default agents."""
    from civion.agents.github_trend_agent import github_trend_agent
    from civion.agents.research_monitor_agent import research_monitor_agent
    from civion.agents.startup_radar_agent import startup_radar_agent
    from civion.agents.market_signal_agent import market_signal_agent
    from civion.agents.cyber_threat_agent import cyber_threat_agent
    from civion.agents.memory_agent import memory_agent
    from civion.agents.sentiment_agent import sentiment_agent

    for agent in [
        github_trend_agent, research_monitor_agent, startup_radar_agent,
        market_signal_agent, cyber_threat_agent, memory_agent, sentiment_agent,
    ]:
        agent_engine.register(agent)
