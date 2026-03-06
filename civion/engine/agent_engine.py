"""
CIVION — Agent Engine
Central engine that registers agents, executes them, logs results,
stores to memory graph, and triggers collaboration analysis.
"""

from __future__ import annotations

import asyncio
import traceback
from typing import Any

from civion.agents.base_agent import BaseAgent, AgentResult
from civion.storage.database import (
    init_db,
    save_run_start,
    save_run_end,
    save_insight,
    save_log,
    save_world_event,
)


class AgentEngine:
    """Manages the lifecycle of all registered agents."""

    def __init__(self) -> None:
        self._agents: dict[str, BaseAgent] = {}

    # ── Registration ──────────────────────────────────────────

    def register_agent(self, agent: BaseAgent) -> None:
        """Register an agent instance with the engine."""
        self._agents[agent.name] = agent

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
            return None

        await save_log(agent.name, f"Starting agent run …")
        run_id = await save_run_start(agent.name)

        try:
            result = await agent.run()
            status = "success" if result.success else "failed"
            await save_run_end(run_id, status, result.content[:2000])

            if result.success and result.content:
                await save_insight(agent.name, result.content, title=result.title)
                await save_log(agent.name, f"Insight saved: {result.title}")

                # v2: Store to memory graph
                await self._store_to_memory(agent, result)

                # v2: Store world events
                await self._store_world_events(agent, result)

            await save_log(agent.name, f"Run finished — {status}")
            return result

        except Exception as exc:
            tb = traceback.format_exc()
            await save_run_end(run_id, "error", str(exc))
            await save_log(agent.name, f"Error: {exc}\n{tb}", level="ERROR")
            return AgentResult(success=False, content=str(exc))

    async def run_all_agents(self) -> list[AgentResult]:
        """Run every registered agent concurrently, then generate collaboration signals."""
        tasks = [self.run_agent(name) for name in self._agents]
        results = await asyncio.gather(*tasks, return_exceptions=False)
        valid = [r for r in results if r is not None]

        # v2: Trigger collaboration engine after all agents run
        await self._run_collaboration(valid)

        return valid

    # ── v2: Memory Graph Integration ──────────────────────────

    async def _store_to_memory(self, agent: BaseAgent, result: AgentResult) -> None:
        """Store the agent result in the memory graph."""
        try:
            from civion.services.memory_graph import MemoryNode, store_insight, link_related_insights

            node = MemoryNode(
                agent_name=agent.name,
                topic=result.title or agent.name,
                content=result.content[:2000],
                tags=getattr(agent, "tags", []),
            )
            node_id = await store_insight(node)
            await link_related_insights(node_id)
            await save_log(agent.name, f"Memory graph: stored node #{node_id}")
        except Exception as exc:
            await save_log(agent.name, f"Memory graph error: {exc}", level="WARNING")

    # ── v2: World Events ──────────────────────────────────────

    async def _store_world_events(self, agent: BaseAgent, result: AgentResult) -> None:
        """Persist any world events attached to the agent result."""
        try:
            for event in result.events:
                await save_world_event(
                    agent_name=agent.name,
                    topic=event.get("topic", ""),
                    description=event.get("description", ""),
                    latitude=float(event.get("latitude", 0)),
                    longitude=float(event.get("longitude", 0)),
                    location=event.get("location", ""),
                )
        except Exception as exc:
            await save_log(agent.name, f"World events error: {exc}", level="WARNING")

    # ── v2: Collaboration ─────────────────────────────────────

    async def _run_collaboration(self, results: list[AgentResult]) -> None:
        """Invoke the collaboration engine to generate cross-agent signals."""
        try:
            from civion.engine.collaboration_engine import generate_signals

            agent_data = []
            for r in results:
                if r.success:
                    agent_data.append({
                        "name": r.title or "unknown",
                        "agent_name": r.title or "unknown",
                        "title": r.title,
                        "content": r.content[:500],
                    })

            if agent_data:
                signals = await generate_signals(agent_data)
                if signals:
                    await save_log("CIVION", f"Collaboration: generated {len(signals)} signal(s)")
        except Exception as exc:
            await save_log("CIVION", f"Collaboration error: {exc}", level="WARNING")

    # ── Bootstrap ─────────────────────────────────────────────

    async def startup(self) -> None:
        """Initialise the database and auto-register built-in agents."""
        await init_db()
        await self._register_builtins()

    async def _register_builtins(self) -> None:
        """Import and register the agents that ship with CIVION."""
        try:
            from civion.agents.trend_agent import TrendAgent
            self.register_agent(TrendAgent())
        except Exception:
            pass

        await self._discover_agents()

    async def _discover_agents(self) -> None:
        """Auto-discover agent modules in the agents package."""
        import importlib
        import pkgutil
        import civion.agents as agents_pkg

        for importer, modname, ispkg in pkgutil.iter_modules(agents_pkg.__path__):
            if modname in ("base_agent", "__init__"):
                continue
            if modname in [a.name.lower().replace(" ", "_") for a in self._agents.values()]:
                continue
            try:
                module = importlib.import_module(f"civion.agents.{modname}")
                for attr_name in dir(module):
                    attr = getattr(module, attr_name)
                    if (
                        isinstance(attr, type)
                        and issubclass(attr, BaseAgent)
                        and attr is not BaseAgent
                        and attr_name not in [type(a).__name__ for a in self._agents.values()]
                    ):
                        self.register_agent(attr())
            except Exception:
                pass


# Module-level singleton
engine = AgentEngine()
