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

    # Enhanced Memory / Signal fields
    source: str = ""
    confidence: float = 1.0


# ── Base Agent ────────────────────────────────────────────────

class BaseAgent(ABC):
    """
    Abstract base class for all CIVION agents.

    Agents follow the Observe -> Plan -> Act loop for autonomous operation.

    Attributes:
        name:         Human-readable agent name.
        description:  What the agent does.
        interval:     Seconds between scheduled runs (0 = manual only).
        data_sources: List of API URLs or identifiers the agent uses.
        tools_allowed: List of tool names this agent can use.
        personality:  One of Explorer, Analyst, Watcher, Predictor.
        tags:         Tags for memory graph categorisation.
    """

    name: str = "unnamed_agent"
    description: str = ""
    interval: int = 3600
    data_sources: list[str] = []
    tools_allowed: list[str] = []    # New: tool system
    personality: str = "Explorer"
    tags: list[str] = []

    def __init__(self) -> None:
        from civion.engine.sandbox import AgentSandbox
        from civion.tools.base_tool import tool_registry
        
        self.sandbox = AgentSandbox(self.name)
        self.tools = {name: tool_registry.get_tool(name, context=self) 
                     for name in self.tools_allowed}
        self.short_term_memory: list[dict[str, Any]] = []

    def __init_subclass__(cls, **kwargs: Any) -> None:
        super().__init_subclass__(**kwargs)
        if "data_sources" not in cls.__dict__:
            cls.data_sources = []
        if "tags" not in cls.__dict__:
            cls.tags = []
        if "tools_allowed" not in cls.__dict__:
            cls.tools_allowed = []

    # ── Execution Engine (OPA Loop) ───────────────────────────

    async def run(self) -> AgentResult:
        """Execute the agent's OPA loop autonomously."""
        try:
            # 1. Observe: Gather environment data and past memory
            context = await self.observe()
            
            # 2. Plan: Decide which action or tool to use
            plan = await self.plan(context)
            
            # 3. Act: Execute the planned tool or action
            result = await self.act(plan)
            
            return result
        except Exception as e:
            return AgentResult(success=False, content=f"Execution loop failed: {e}")

    async def observe(self) -> dict[str, Any]:
        """Gather context from memory and data sources."""
        recent_memory = await self.search_memory(limit=3)
        return {
            "recent_memory": recent_memory,
            "data_sources": self.data_sources,
            "short_term_memory": self.short_term_memory[-5:],
            "system_prompt": self.personality_prompt()
        }

    async def plan(self, context: dict[str, Any]) -> dict[str, Any]:
        """Determine the next step based on context."""
        from civion.services.llm_service import llm
        
        tools_desc = "\n".join([f"- {t.name}: {t.description}" for t in self.tools.values()])
        prompt = f"""
        Current Context: {context}
        Available Tools:
        {tools_desc}
        
        You are {self.name}, a {self.personality} agent. 
        Based on the context, decide the next action. 
        If you have enough information, generate an insight. 
        Otherwise, select a tool to use.
        
        Return a JSON object with:
        "action": "use_tool" | "generate_insight"
        "tool_name": (string, if action is use_tool)
        "tool_params": (dict, if action is use_tool)
        "reasoning": (string)
        """
        
        # In a real implementation, we'd use structured LLM output
        # For now, we mock a decision or use a simple heuristic
        return {"action": "generate_insight", "reasoning": "Baseline autonomous loop iteration"}

    async def act(self, plan: dict[str, Any]) -> AgentResult:
        """Perform the action determined in the planning phase."""
        if plan["action"] == "use_tool":
            tool_name = plan["tool_name"]
            if tool_name in self.tools:
                tool_result = await self.tools[tool_name].execute(**plan["tool_params"])
                self.short_term_memory.append({"tool": tool_name, "result": tool_result})
                # Re-run loop or return updated result? For flow, we return a summary.
                return AgentResult(success=True, content=f"Used tool {tool_name}: {tool_result}")
        
        # Default: perform the subclass-specific logic (formerly the entire run() method)
        return await self.execute_task()

    @abstractmethod
    async def execute_task(self) -> AgentResult:
        """The core task implementation formerly known as run()."""
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
            "tools_allowed": self.tools_allowed,
            "personality": self.personality,
            "personality_emoji": p.get("emoji", "🤖"),
            "personality_color": p.get("color", "#6366f1"),
            "tags": self.tags,
        }

    # ── Memory helpers ────────────────────────────────────────

    async def search_memory(self, query: str = "", tags: list[str] | None = None, limit: int = 5) -> list[dict[str, Any]]:
        """Search the shared memory graph for relevant past insights."""
        from civion.services.memory_graph import search_insights
        return await search_insights(query=query, tags=tags, limit=limit)

    async def emit_signal(self, title: str, description: str, confidence: float = 0.5) -> int:
        """Emit a collaboration signal to the collective intelligence layer."""
        from civion.storage.database import DB_PATH
        import aiosqlite
        import json
        from datetime import datetime
        
        async with aiosqlite.connect(str(DB_PATH)) as db:
            cursor = await db.execute(
                """INSERT INTO collaboration_signals 
                   (title, description, confidence, agents_involved, created_at)
                   VALUES (?, ?, ?, ?, ?)""",
                (title, description, confidence, json.dumps([self.name]), datetime.now().isoformat())
            )
            await db.commit()
            return cursor.lastrowid

    def __repr__(self) -> str:
        return f"<Agent:{self.name} ({self.personality})>"
