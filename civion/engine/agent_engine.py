"""
CIVION — Agent Engine
Central engine that manages agent lifecycle: registration, execution,
insight storage, event emission, and collaboration trigger.

Uses the agent_loader for discovery, insights_service for
dual-storage, and event_engine for world map events.
"""

from __future__ import annotations

import asyncio
import logging
import traceback
from typing import Any

from civion.agents.base_agent import BaseAgent, AgentResult
from civion.storage.database import (
    init_db,
    register_agent_db,
    save_run_start,
    save_run_end,
)
from civion.services.logging_service import log_agent, log_system

logger = logging.getLogger("civion.engine")


class AgentController:
    """Manages the lifecycle, health, and execution of all agents."""

    def __init__(self) -> None:
        self._agents: dict[str, BaseAgent] = {}
        self._running_tasks: dict[str, asyncio.Task] = {}
        self._health_status: dict[str, str] = {}
        self._is_started = False

    # ── Registration ──────────────────────────────────────────

    def register_agent(self, agent: BaseAgent) -> None:
        """Register an agent instance with the controller."""
        self._agents[agent.name] = agent
        self._health_status[agent.name] = "healthy"
        logger.info("Registered agent: %s (%s)", agent.name, agent.personality)

    def get_agent(self, name: str) -> BaseAgent | None:
        return self._agents.get(name)

    def list_agents(self) -> list[dict[str, Any]]:
        """Return info dicts for every registered agent with health status."""
        agents_info = []
        for agent in self._agents.values():
            info = agent.info()
            info["health"] = self._health_status.get(agent.name, "unknown")
            info["is_running"] = agent.name in self._running_tasks
            agents_info.append(info)
        return agents_info

    # ── Lifecycle Management ──────────────────────────────────

    async def start_agent(self, name: str) -> bool:
        """Start an agent as an independent background task."""
        agent = self._agents.get(name)
        if not agent:
            return False
            
        if name in self._running_tasks:
            logger.info("Agent %s is already running", name)
            return True

        # For persistent agents, we might have a loop here. 
        # For now, we allow the scheduler to handle intervals, 
        # but the controller tracks the 'active' state.
        task = asyncio.create_task(self.run_agent(name))
        self._running_tasks[name] = task
        return True

    async def stop_agent(self, name: str) -> bool:
        """Stop a running agent task."""
        task = self._running_tasks.pop(name, None)
        if task:
            task.cancel()
            logger.info("Stopped agent: %s", name)
            return True
        return False

    def get_health(self) -> dict[str, Any]:
        """Return system-wide health and agent status."""
        return {
            "controller_started": self._is_started,
            "total_agents": len(self._agents),
            "running_agents": len(self._running_tasks),
            "health_map": self._health_status
        }

    # ── Execution ─────────────────────────────────────────────

    async def run_agent(self, name: str) -> AgentResult | None:
        """Run a single agent run and persist results."""
        agent = self._agents.get(name)
        if not agent:
            logger.warning("Agent '%s' not found", name)
            return None

        await log_agent(agent.name, "Starting autonomous agent run …")
        run_id = await save_run_start(agent.name)

        try:
            result = await agent.run()
            status = "success" if result.success else "failed"
            
            # Update health
            if not result.success:
                self._health_status[name] = "degraded"
            else:
                self._health_status[name] = "healthy"

            await save_run_end(run_id, status, result.content[:2000])

            if result.success and result.content:
                await self._store_insight(agent, result)
                await self._store_events(agent, result)

            await log_agent(agent.name, f"Run finished — {status}")
            return result

        except Exception as exc:
            tb = traceback.format_exc()
            self._health_status[name] = "error"
            await save_run_end(run_id, "error", str(exc))
            await log_agent(agent.name, f"Error: {exc}\n{tb}", level="ERROR")
            return AgentResult(success=False, content=str(exc))
        finally:
            self._running_tasks.pop(name, None)

    async def run_all_agents(self) -> list[AgentResult]:
        """Run every registered agent concurrently."""
        tasks = [self.run_agent(name) for name in self._agents]
        results = await asyncio.gather(*tasks, return_exceptions=False)
        valid = [r for r in results if r is not None]

        await self._run_collaboration(valid)
        return valid

    # ── Insight Storage ───────────────────────────────────────

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

    # ── Event Emission ────────────────────────────────────────

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

    # ── Collaboration ─────────────────────────────────────────

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
        """Initialise DB, discover agents, register them."""
        if self._is_started:
            return

        await init_db()
        if load_agents:
            await self._load_agents()
        
        self._is_started = True

    async def shutdown(self) -> None:
        """Shutdown the controller and stop all tasks."""
        logger.info("Agent controller shutting down...")
        for name in list(self._running_tasks.keys()):
            await self.stop_agent(name)
        self._is_started = False

    async def reload(self) -> None:
        """Reload agents from the filesystem."""
        logger.info("Reloading agents...")
        # Cancel all running tasks first
        for name in list(self._running_tasks.keys()):
            await self.stop_agent(name)
        
        # Clear existing agent registry
        self._agents.clear()
        self._health_status.clear()
        
        # Re-discover and register
        await self._load_agents()
        logger.info("Agent reload complete.")

    async def _load_agents(self) -> None:
        """Use the agent_loader to discover and register all agents."""
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


# Module-level singleton
engine = AgentController()
