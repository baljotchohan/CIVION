"""
CIVION — Agent Controller System
Central management of agent lifecycle (start, stop, pause, resume, restart),
health monitoring, and event publishing.
"""

from __future__ import annotations

import asyncio
import logging
import traceback
from enum import Enum
from typing import Any

from civion.agents.base_agent import BaseAgent, AgentResult
from civion.storage.database import (
    init_db,
    register_agent_db,
    save_run_start,
    save_run_end,
)
from civion.services.logging_service import log_agent, log_system

logger = logging.getLogger("civion.agent_controller")

class AgentStatus(str, Enum):
    IDLE = "IDLE"
    RUNNING = "RUNNING"
    PAUSED = "PAUSED"
    ERROR = "ERROR"
    STOPPED = "STOPPED"

class AgentInstance:
    """Wrapper around a BaseAgent tracking its lifecycle and metrics."""
    def __init__(self, agent: BaseAgent):
        self.agent = agent
        self.status: AgentStatus = AgentStatus.STOPPED
        self.started_at: str | None = None
        self.last_run: str | None = None
        self.run_count: int = 0
        self.error_count: int = 0
        self.last_error: str | None = None
        self.task: asyncio.Task | None = None

    def to_dict(self) -> dict[str, Any]:
        info = self.agent.info()
        info.update({
            "status": self.status.value,
            "started_at": self.started_at,
            "last_run": self.last_run,
            "run_count": self.run_count,
            "error_count": self.error_count,
            "last_error": self.last_error,
        })
        return info

class AgentController:
    """Central management of all agent instances."""

    def __init__(self) -> None:
        self._instances: dict[str, AgentInstance] = {}
        self._is_started = False
        self._monitor_task: asyncio.Task | None = None

    # ── Registration ──────────────────────────────────────────

    def register_agent(self, agent: BaseAgent) -> None:
        self._instances[agent.name] = AgentInstance(agent)
        logger.info("Registered agent: %s (%s)", agent.name, agent.personality)

    def get_agent(self, name: str) -> BaseAgent | None:
        inst = self._instances.get(name)
        return inst.agent if inst else None

    def list_agents(self) -> list[dict[str, Any]]:
        return [inst.to_dict() for inst in self._instances.values()]

    def get_status(self, name: str) -> dict[str, Any] | None:
        inst = self._instances.get(name)
        return inst.to_dict() if inst else None

    # ── Lifecycle Management ──────────────────────────────────

    async def start_agent(self, name: str) -> bool:
        inst = self._instances.get(name)
        if not inst: return False
        
        if inst.status in (AgentStatus.RUNNING, AgentStatus.PAUSED):
            return True
            
        from datetime import datetime, timezone
        inst.started_at = datetime.now(timezone.utc).isoformat()
        inst.status = AgentStatus.RUNNING
        
        inst.task = asyncio.create_task(self.run_agent_loop(name))
        await self._publish_event("agent_started", {"agent": name, "timestamp": inst.started_at})
        return True

    async def stop_agent(self, name: str) -> bool:
        inst = self._instances.get(name)
        if not inst: return False
        
        if inst.task:
            inst.task.cancel()
            inst.task = None
            
        inst.status = AgentStatus.STOPPED
        from datetime import datetime, timezone
        await self._publish_event("agent_stopped", {"agent": name, "timestamp": datetime.now(timezone.utc).isoformat()})
        return True

    async def pause_agent(self, name: str) -> bool:
        inst = self._instances.get(name)
        if not inst or inst.status != AgentStatus.RUNNING: return False
        inst.status = AgentStatus.PAUSED
        await self._publish_event("agent_paused", {"agent": name})
        return True

    async def resume_agent(self, name: str) -> bool:
        inst = self._instances.get(name)
        if not inst or inst.status != AgentStatus.PAUSED: return False
        inst.status = AgentStatus.RUNNING
        await self._publish_event("agent_resumed", {"agent": name})
        return True

    async def restart_agent(self, name: str) -> bool:
        await self.stop_agent(name)
        await asyncio.sleep(0.5)
        return await self.start_agent(name)

    # ── Execution Loop ────────────────────────────────────────

    async def run_agent_loop(self, name: str) -> None:
        inst = self._instances.get(name)
        if not inst: return
        
        interval = inst.agent.interval or 3600
        
        while inst.status in (AgentStatus.RUNNING, AgentStatus.PAUSED):
            if inst.status == AgentStatus.PAUSED:
                await asyncio.sleep(1)
                continue
                
            try:
                await self.run_agent_once(name)
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Agent {name} loop error: {e}")
                
            await asyncio.sleep(interval)

    async def run_agent_once(self, name: str) -> AgentResult | None:
        """Run a single agent execution cycle."""
        inst = self._instances.get(name)
        if not inst: return None
        
        agent = inst.agent
        
        from datetime import datetime, timezone
        inst.last_run = datetime.now(timezone.utc).isoformat()
        inst.run_count += 1

        await log_agent(agent.name, "Starting autonomous agent run …")
        run_id = await save_run_start(agent.name)

        try:
            result = await agent.run()
            status = "success" if result.success else "failed"
            
            if not result.success:
                inst.error_count += 1
                inst.last_error = result.content[:500]
                inst.status = AgentStatus.ERROR
            else:
                inst.last_error = None
                if inst.status == AgentStatus.ERROR:
                    inst.status = AgentStatus.RUNNING

            await save_run_end(run_id, status, result.content[:2000])

            if result.success and result.content:
                await self._store_insight(agent, result)
                await self._store_events(agent, result)

            await log_agent(agent.name, f"Run finished — {status}")
            return result

        except Exception as exc:
            tb = traceback.format_exc()
            inst.error_count += 1
            inst.last_error = str(exc)
            inst.status = AgentStatus.ERROR
            await save_run_end(run_id, "error", str(exc))
            await log_agent(agent.name, f"Error: {exc}\n{tb}", level="ERROR")
            await self._publish_event("agent_error", {"agent": name, "error": str(exc)})
            return AgentResult(success=False, content=str(exc))

    # ── Health Monitoring ─────────────────────────────────────

    async def monitor_health(self) -> None:
        """Background task to auto-restart failed agents."""
        while self._is_started:
            for name, inst in self._instances.items():
                if inst.status == AgentStatus.ERROR:
                    logger.warning(f"Health monitor: restarting failed agent {name}")
                    await self._publish_event("agent_restarted", {"agent": name, "reason": "auto-recovery"})
                    await self.restart_agent(name)
            await asyncio.sleep(30) # Check every 30s

    def get_health(self) -> dict[str, Any]:
        running = sum(1 for i in self._instances.values() if i.status == AgentStatus.RUNNING)
        errors = sum(1 for i in self._instances.values() if i.status == AgentStatus.ERROR)
        return {
            "controller_started": self._is_started,
            "total_agents": len(self._instances),
            "running_agents": running,
            "error_agents": errors,
            "health_map": {name: i.status.value for name, i in self._instances.items()}
        }

    # ── Legacy compatibility & storage ────────────────────────

    async def run_agent(self, name: str) -> AgentResult | None:
        """Legacy compatibility for triggering single runs from API/Planner"""
        return await self.run_agent_once(name)

    async def run_all_agents(self) -> list[AgentResult]:
        """Run all registered agents once concurrently."""
        tasks = [self.run_agent_once(name) for name in self._instances]
        results = await asyncio.gather(*tasks, return_exceptions=False)
        valid = [r for r in results if r is not None]
        await self._run_collaboration(valid)
        return valid

    async def _store_insight(self, agent: BaseAgent, result: AgentResult) -> None:
        try:
            from civion.services.insights_service import store_insight
            await store_insight(
                agent_name=agent.name,
                title=result.title,
                content=result.content[:2000],
                tags=getattr(agent, "tags", []),
                source=getattr(result, "source", ""),
                confidence=getattr(result, "confidence", 1.0),
            )
        except Exception as exc:
            logger.warning("Insight storage failed for %s: %s", agent.name, exc)

    async def _store_events(self, agent: BaseAgent, result: AgentResult) -> None:
        try:
            from civion.engine.event_engine import event_engine, AgentEvent
            for e in result.events:
                await event_engine.emit(AgentEvent(
                    agent_name=agent.name,
                    topic=e.get("topic", ""),
                    description=e.get("description", ""),
                    latitude=float(e.get("latitude", 0)),
                    longitude=float(e.get("longitude", 0)),
                    location=e.get("location", ""),
                ))
        except Exception as exc:
            logger.warning("Event emission failed for %s: %s", agent.name, exc)

    async def _run_collaboration(self, results: list[AgentResult]) -> None:
        try:
            from civion.engine.signal_engine import generate_signals
            agent_data = [
                {"agent_name": r.title or "unknown", "title": r.title, "content": r.content[:500]}
                for r in results if r.success
            ]
            if agent_data:
                signals = await generate_signals(agent_data)
                if signals:
                    await log_system(f"Collaboration: generated {len(signals)} signal(s)")
        except Exception as exc:
            await log_system(f"Collaboration error: {exc}", level="WARNING")

    # ── Bootstrap ─────────────────────────────────────────────

    async def startup(self, load_agents: bool = True) -> None:
        if self._is_started:
            return

        await init_db()
        if load_agents:
            await self._load_agents()
        
        self._is_started = True
        self._monitor_task = asyncio.create_task(self.monitor_health())

    async def shutdown(self) -> None:
        logger.info("Agent controller shutting down...")
        self._is_started = False
        if self._monitor_task:
            self._monitor_task.cancel()
            self._monitor_task = None
        for name in list(self._instances.keys()):
            await self.stop_agent(name)

    async def reload(self) -> None:
        logger.info("Reloading agents...")
        for name in list(self._instances.keys()):
            await self.stop_agent(name)
        
        self._instances.clear()
        await self._load_agents()

    async def _load_agents(self) -> None:
        from civion.engine.agent_loader import discover_agents
        agents = discover_agents()
        for agent in agents:
            self.register_agent(agent)
            try:
                await register_agent_db(
                    name=agent.name,
                    description=agent.description,
                    personality=agent.personality,
                    interval=agent.interval,
                    tags=getattr(agent, "tags", []),
                )
            except Exception:
                pass

    async def _publish_event(self, event_type: str, payload: dict) -> None:
        try:
            from civion.engine.event_stream import event_stream
            await event_stream.publish(event_type, payload)
        except Exception:
            pass

agent_controller = AgentController()
