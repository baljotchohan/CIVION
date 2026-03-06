"""
CIVION — Base Agent Class
All custom agents must inherit from BaseAgent and implement the run() method.

v2: Added personality system (Explorer, Analyst, Watcher, Predictor).
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any


# ── Personality Definitions ───────────────────────────────────

PERSONALITIES = {
    "Explorer": {
        "emoji": "🔍",
        "color": "#06b6d4",
        "description": "Searches for new data sources and frontiers",
        "system_prompt": (
            "You are an Explorer agent. Your strength is discovering new, "
            "unexpected data sources and uncovering hidden patterns. "
            "Prioritise breadth over depth. Seek the novel and surprising."
        ),
    },
    "Analyst": {
        "emoji": "📊",
        "color": "#6366f1",
        "description": "Performs deeper analysis and structured reasoning",
        "system_prompt": (
            "You are an Analyst agent. Your strength is rigorous, detailed analysis. "
            "Break information into structured sections, quantify when possible, "
            "and produce well-reasoned conclusions with evidence."
        ),
    },
    "Watcher": {
        "emoji": "👁️",
        "color": "#eab308",
        "description": "Monitors alerts, anomalies, and changes",
        "system_prompt": (
            "You are a Watcher agent. Your strength is detecting changes, "
            "anomalies, and alert conditions. Compare current data to baselines, "
            "flag anything unusual, and produce concise alert summaries."
        ),
    },
    "Predictor": {
        "emoji": "🔮",
        "color": "#a855f7",
        "description": "Generates future predictions and trend projections",
        "system_prompt": (
            "You are a Predictor agent. Your strength is forecasting and "
            "trend projection. Based on available data, produce evidence-based "
            "predictions with confidence levels and reasoning."
        ),
    },
}


# ── Agent Result ──────────────────────────────────────────────

@dataclass
class AgentResult:
    """Standardised result object returned by every agent run."""
    success: bool
    title: str = ""
    content: str = ""
    data: dict[str, Any] = field(default_factory=dict)

    # v2: Optional world-event metadata for the World Map
    events: list[dict[str, Any]] = field(default_factory=list)
    # Each event: {"topic": "...", "description": "...",
    #              "latitude": 0.0, "longitude": 0.0, "location": "..."}


# ── Base Agent ────────────────────────────────────────────────

class BaseAgent(ABC):
    """
    Abstract base class for all CIVION agents.

    Subclasses must implement ``run()`` and return an ``AgentResult``.

    Attributes:
        name:         Human-readable agent name.
        description:  What the agent does.
        interval:     Seconds between scheduled runs (0 = manual only).
        data_sources: List of API URLs or identifiers the agent uses.
        personality:  One of Explorer, Analyst, Watcher, Predictor.
        tags:         Tags for memory graph categorisation.
    """

    name: str = "unnamed_agent"
    description: str = ""
    interval: int = 3600
    data_sources: list[str] = []
    personality: str = "Explorer"    # v2: personality system
    tags: list[str] = []             # v2: memory graph tags

    def __init_subclass__(cls, **kwargs: Any) -> None:
        super().__init_subclass__(**kwargs)
        if "data_sources" not in cls.__dict__:
            cls.data_sources = []
        if "tags" not in cls.__dict__:
            cls.tags = []

    # ── Core interface ────────────────────────────────────────

    @abstractmethod
    async def run(self) -> AgentResult:
        """Execute the agent's main task and return an AgentResult."""
        ...

    # ── Personality helpers ───────────────────────────────────

    def personality_prompt(self) -> str:
        """Return the LLM system prompt for this agent's personality."""
        p = PERSONALITIES.get(self.personality, PERSONALITIES["Explorer"])
        return p["system_prompt"]

    def personality_info(self) -> dict[str, str]:
        """Return emoji, color, description for this personality."""
        return PERSONALITIES.get(self.personality, PERSONALITIES["Explorer"])

    # ── Representation ────────────────────────────────────────

    def info(self) -> dict[str, Any]:
        """Return a JSON-serialisable summary of this agent."""
        p = self.personality_info()
        return {
            "name": self.name,
            "description": self.description,
            "interval": self.interval,
            "data_sources": self.data_sources,
            "personality": self.personality,
            "personality_emoji": p.get("emoji", "🤖"),
            "personality_color": p.get("color", "#6366f1"),
            "tags": self.tags,
        }

    def __repr__(self) -> str:
        return f"<Agent:{self.name} ({self.personality})>"
