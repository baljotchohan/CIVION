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


class AgentEngine:
    """Manages the lifecycle of all registered agents."""

    def __init__(self) -> None:
        self._agents: dict[str, BaseAgent] = {}

    # ── Registration ──────────────────────────────────────────

    def register_agent(self, agent: BaseAgent) -> None:
        """Register an agent instance with the engine."""
        self._agents[agent.name] = agent
        logger.info("Registered agent: %s (%s)", agent.name, agent.personality)

    def get_agent(self, name: str) -> BaseAgent | None:
        return self._agents.get(name)

    def list_agents(self) -> list[dict[str, Any]]:
        """Return info dicts for every registered agent."""
        return [agent.info() for agent in self._agents.values()]

    # ── Execution ─────────────────────────────────────────────

    async def run_agent(self, name: str) -> AgentResult | None:
        """Run a single agent by name and persist results."""
        agent = self._agents.get(name)
        if not agent:
            logger.warning("Agent '%s' not found", name)
            return None

        await log_agent(agent.name, "Starting agent run …")
        run_id = await save_run_start(agent.name)

        try:
            result = await agent.run()
            status = "success" if result.success else "failed"
            await save_run_end(run_id, status, result.content[:2000])

            if result.success and result.content:
                # Store insight (auto-mirrors to memory graph)
                await self._store_insight(agent, result)

                # Store world events
                await self._store_events(agent, result)

            await log_agent(agent.name, f"Run finished — {status}")
            return result

        except Exception as exc:
            tb = traceback.format_exc()
            await save_run_end(run_id, "error", str(exc))
            await log_agent(agent.name, f"Error: {exc}\n{tb}", level="ERROR")
            return AgentResult(success=False, content=str(exc))

    async def run_all_agents(self) -> list[AgentResult]:
        """Run every registered agent concurrently, then trigger collaboration."""
        tasks = [self.run_agent(name) for name in self._agents]
        results = await asyncio.gather(*tasks, return_exceptions=False)
        valid = [r for r in results if r is not None]

        # Trigger collaboration engine
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
            from civion.engine.collaboration_engine import generate_signals
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

    async def startup(self) -> None:
        """Initialise DB, discover agents, register them."""
        await init_db()
        await self._load_agents()

    async def _load_agents(self) -> None:
        """Use the agent_loader to discover and register all agents."""
        from civion.engine.agent_loader import discover_agents

        agents = discover_agents()
        for agent in agents:
            self.register_agent(agent)

            # Persist to agents registry table
            try:
                await register_agent_db(
                    name=agent.name,
                    description=agent.description,
                    personality=agent.personality,
                    interval=agent.interval,
                    tags=getattr(agent, "tags", []),
                )
            except Exception:
                pass  # registry is optional


# Module-level singleton
engine = AgentEngine()
