"""
CIVION Scheduler
APScheduler-based task scheduling for autonomous operations.
"""
from __future__ import annotations
import asyncio
from datetime import datetime, timezone
from typing import Any, Callable, Dict, List, Optional
from civion.core.logger import engine_logger

log = engine_logger("scheduler")


class ScheduledJob:
    """A scheduled job."""
    def __init__(self, name: str, func: Callable, interval_seconds: int):
        self.name = name
        self.func = func
        self.interval_seconds = interval_seconds
        self.is_active = False
        self.last_run: Optional[str] = None
        self.run_count = 0
        self._task: Optional[asyncio.Task] = None

    async def _loop(self):
        while self.is_active:
            try:
                if asyncio.iscoroutinefunction(self.func):
                    await self.func()
                else:
                    self.func()
                self.last_run = datetime.now(timezone.utc).isoformat()
                self.run_count += 1
            except Exception as e:
                log.error(f"Job '{self.name}' error: {e}")
            await asyncio.sleep(self.interval_seconds)


class Scheduler:
    """Task scheduler for periodic operations."""

    def __init__(self):
        self._jobs: Dict[str, ScheduledJob] = {}
        self._running = False

    def add_job(
        self,
        name: str,
        func: Callable,
        interval_seconds: int = 300,
    ) -> None:
        """Add a scheduled job."""
        self._jobs[name] = ScheduledJob(name, func, interval_seconds)
        log.info(f"Job added: {name} (every {interval_seconds}s)")

    async def start(self) -> None:
        """Start all scheduled jobs."""
        self._running = True
        for job in self._jobs.values():
            job.is_active = True
            job._task = asyncio.create_task(job._loop())
        log.info(f"Scheduler started with {len(self._jobs)} jobs")

    async def stop(self) -> None:
        """Stop all scheduled jobs."""
        self._running = False
        for job in self._jobs.values():
            job.is_active = False
            if job._task:
                job._task.cancel()
        log.info("Scheduler stopped")

    def list_jobs(self) -> List[Dict[str, Any]]:
        """List all jobs."""
        return [{
            "name": j.name,
            "interval": j.interval_seconds,
            "active": j.is_active,
            "last_run": j.last_run,
            "run_count": j.run_count,
        } for j in self._jobs.values()]


# Singleton
scheduler = Scheduler()
