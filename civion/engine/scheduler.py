"""
CIVION — Agent Scheduler
Uses APScheduler to run agents at their configured intervals.
Properly handles async execution.
"""

from __future__ import annotations

import logging
from typing import TYPE_CHECKING

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger

if TYPE_CHECKING:
    from civion.engine.agent_engine import AgentEngine

logger = logging.getLogger("civion.scheduler")


class AgentScheduler:
    """Wraps APScheduler to execute agents on a recurring basis."""

    def __init__(self, engine: "AgentEngine") -> None:
        self.engine = engine
        self._scheduler = AsyncIOScheduler()

    def schedule_agents(self) -> None:
        """
        Register a job for every agent whose interval > 0.
        Call this *after* agents have been registered with the engine.
        """
        for agent_info in self.engine.list_agents():
            name = agent_info["name"]
            interval = agent_info.get("interval", 0)

            if interval <= 0:
                logger.info("Agent '%s' is manual-only (interval=0)", name)
                continue

            self._scheduler.add_job(
                self._run_agent_wrapper,
                trigger=IntervalTrigger(seconds=interval),
                args=[name],
                id=f"civion_{name}",
                replace_existing=True,
                name=f"CIVION · {name}",
            )
            logger.info("Scheduled '%s' every %ds", name, interval)

    async def _run_agent_wrapper(self, name: str) -> None:
        """Wrapper so APScheduler can await our async run_agent."""
        try:
            await self.engine.run_agent(name)
        except Exception as exc:
            logger.error("Scheduled run of '%s' failed: %s", name, exc)

    def start(self) -> None:
        """Start the background scheduler."""
        if not self._scheduler.running:
            self._scheduler.start()
            logger.info("Scheduler started")

    def stop(self) -> None:
        """Gracefully shut down the scheduler."""
        if self._scheduler.running:
            self._scheduler.shutdown(wait=False)
            logger.info("Scheduler stopped")
