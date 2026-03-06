"""
CIVION — Event Engine
Manages geo-located events emitted by agents.
Events appear on the World Map dashboard panel.

Each event represents an agent discovery tied to a real-world location:
  - "AI startup detected in San Francisco"
  - "Robotics research published in Tokyo"
  - "Cybersecurity threat in Berlin"
"""

from __future__ import annotations

import logging
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any

from civion.storage.database import save_world_event, get_world_events

logger = logging.getLogger("civion.events")


# ── Event Data Structure ──────────────────────────────────────

@dataclass
class AgentEvent:
    """A geo-located event emitted by an agent."""
    agent_name: str
    topic: str
    description: str
    latitude: float = 0.0
    longitude: float = 0.0
    location: str = ""
    timestamp: str = field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )

    def to_dict(self) -> dict[str, Any]:
        return {
            "agent_name": self.agent_name,
            "topic": self.topic,
            "description": self.description,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "location": self.location,
            "timestamp": self.timestamp,
        }


# ── Event Engine ──────────────────────────────────────────────

class EventEngine:
    """
    Central service for storing and retrieving agent events.
    Agents call ``emit()`` to publish events to the database.
    """

    async def emit(self, event: AgentEvent) -> int:
        """Store an event and return its row id."""
        event_id = await save_world_event(
            agent_name=event.agent_name,
            topic=event.topic,
            description=event.description,
            latitude=event.latitude,
            longitude=event.longitude,
            location=event.location,
        )
        logger.info(
            "Event emitted: [%s] %s @ %s",
            event.agent_name, event.topic, event.location or "unknown",
        )
        return event_id

    async def emit_many(self, events: list[AgentEvent]) -> list[int]:
        """Store multiple events. Returns list of ids."""
        ids = []
        for event in events:
            eid = await self.emit(event)
            ids.append(eid)
        return ids

    async def get_recent(self, limit: int = 100) -> list[dict[str, Any]]:
        """Retrieve the most recent events."""
        return await get_world_events(limit)


# Module-level singleton
event_engine = EventEngine()
