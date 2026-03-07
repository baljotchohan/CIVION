"""
CIVION Base Agent
Abstract base class for all intelligence-gathering agents.
"""
from __future__ import annotations
import asyncio
import uuid
from abc import ABC, abstractmethod
from datetime import datetime
from typing import Any, Dict, List, Optional
from dataclasses import dataclass, field

from civion.core.constants import AgentState
from civion.core.logger import agent_logger
from civion.services.data_service import data_service
from civion.services.memory_service import memory_service


@dataclass
class AgentResult:
    """Result from a single agent scan cycle."""
    agent_name: str
    insights: List[Dict[str, Any]] = field(default_factory=list)
    signals: List[Dict[str, Any]] = field(default_factory=list)
    errors: List[str] = field(default_factory=list)
    duration_seconds: float = 0.0
    timestamp: str = field(default_factory=lambda: datetime.utcnow().isoformat())


class BaseAgent(ABC):
    """
    Abstract base for all CIVION agents.
    Lifecycle: init → scan → analyze → report → (repeat)
    """

    def __init__(self, name: str, description: str = ""):
        self.name = name
        self.description = description
        self.state = AgentState.IDLE
        self.log = agent_logger(name)
        self._running = False
        self._scan_count = 0
        self._last_run: Optional[str] = None
        self._error_count = 0
        self._total_insights = 0
        self._total_signals = 0

    # ── Abstract Methods ─────────────────────────────
    @abstractmethod
    async def scan(self) -> List[Dict[str, Any]]:
        """Scan data sources and return raw data."""
        ...

    @abstractmethod
    async def analyze(self, raw_data: List[Dict[str, Any]]) -> AgentResult:
        """Analyze raw data and produce insights/signals."""
        ...

    # ── Lifecycle ────────────────────────────────────
    async def run_cycle(self) -> AgentResult:
        """Execute one complete scan-analyze-report cycle."""
        start = asyncio.get_event_loop().time()
        self.state = AgentState.SCANNING
        self.log.info(f"[bold magenta]{self.name}[/] starting scan cycle #{self._scan_count + 1}")

        try:
            # 1. Scan
            raw_data = await self.scan()

            # 2. Analyze
            self.state = AgentState.ANALYZING
            result = await self.analyze(raw_data)
            result.duration_seconds = asyncio.get_event_loop().time() - start

            # 3. Report - store results
            self.state = AgentState.REPORTING
            for insight in result.insights:
                insight["agent_name"] = self.name
                await data_service.save_insight(insight)
                await memory_service.store(
                    insight.get("content", insight.get("title", "")),
                    category="insight",
                    tags=insight.get("tags", [self.name]),
                )

            for signal in result.signals:
                signal["agent_name"] = self.name
                await data_service.save_signal(signal)

            # Update stats
            self._scan_count += 1
            self._last_run = datetime.utcnow().isoformat()
            self._total_insights += len(result.insights)
            self._total_signals += len(result.signals)
            self.state = AgentState.IDLE

            await data_service.log_agent_activity(self.name, {
                "action": "scan_complete",
                "insights_found": len(result.insights),
                "signals_found": len(result.signals),
                "duration": result.duration_seconds,
            })

            self.log.info(
                f"[bold magenta]{self.name}[/] cycle complete: "
                f"{len(result.insights)} insights, {len(result.signals)} signals "
                f"({result.duration_seconds:.1f}s)"
            )
            return result

        except Exception as e:
            self.state = AgentState.ERROR
            self._error_count += 1
            self.log.error(f"[bold red]{self.name}[/] scan error: {e}")
            return AgentResult(
                agent_name=self.name,
                errors=[str(e)],
                duration_seconds=asyncio.get_event_loop().time() - start,
            )

    async def start(self):
        """Start continuous scanning."""
        self._running = True
        self.log.info(f"[bold green]{self.name}[/] started")

    async def stop(self):
        """Stop continuous scanning."""
        self._running = False
        self.state = AgentState.STOPPED
        self.log.info(f"[bold yellow]{self.name}[/] stopped")

    @property
    def is_running(self) -> bool:
        return self._running

    def to_dict(self) -> Dict[str, Any]:
        """Serialize agent status."""
        return {
            "name": self.name,
            "description": self.description,
            "state": self.state.value,
            "running": self._running,
            "scan_count": self._scan_count,
            "last_run": self._last_run,
            "error_count": self._error_count,
            "total_insights": self._total_insights,
            "total_signals": self._total_signals,
        }
