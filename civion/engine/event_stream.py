"""
CIVION Event Stream
Real-time event broadcasting for WebSocket and SSE.
"""
from __future__ import annotations
import asyncio
import json
from datetime import datetime, UTC
from typing import Any, Callable, Dict, List, Set
from civion.core.logger import engine_logger

log = engine_logger("event_stream")


class EventStream:
    """Central event bus for real-time broadcasting."""

    def __init__(self):
        self._subscribers: Dict[str, List[Callable]] = {}
        self._event_history: List[Dict] = []
        self._ws_connections: Set = set()

    def subscribe(self, event_type: str, callback: Callable) -> None:
        """Subscribe to a specific event type."""
        if event_type not in self._subscribers:
            self._subscribers[event_type] = []
        self._subscribers[event_type].append(callback)

    def unsubscribe(self, event_type: str, callback: Callable) -> None:
        """Unsubscribe from an event type."""
        if event_type in self._subscribers:
            self._subscribers[event_type] = [
                cb for cb in self._subscribers[event_type] if cb != callback
            ]

    async def emit(self, event_type: str, data: Dict[str, Any]) -> None:
        """Emit an event to all subscribers."""
        event = {
            "type": event_type,
            "data": data,
            "timestamp": datetime.now(UTC).isoformat(),
        }
        self._event_history.append(event)
        if len(self._event_history) > 500:
            self._event_history = self._event_history[-250:]

        # Notify callbacks
        for callback in self._subscribers.get(event_type, []):
            try:
                if asyncio.iscoroutinefunction(callback):
                    await callback(event)
                else:
                    callback(event)
            except Exception as e:
                log.error(f"Event callback error: {e}")

        # Notify WebSocket connections
        message = json.dumps(event)
        dead = set()
        for ws in self._ws_connections:
            try:
                await ws.send_text(message)
            except Exception:
                dead.add(ws)
        self._ws_connections -= dead

    def register_ws(self, ws) -> None:
        """Register a WebSocket connection."""
        self._ws_connections.add(ws)

    def unregister_ws(self, ws) -> None:
        """Unregister a WebSocket connection."""
        self._ws_connections.discard(ws)

    def get_recent_events(self, limit: int = 50, event_type: str = None) -> List[Dict]:
        """Get recent events."""
        events = self._event_history
        if event_type:
            events = [e for e in events if e["type"] == event_type]
        return list(reversed(events[-limit:]))

    @property
    def connection_count(self) -> int:
        return len(self._ws_connections)


# Singleton
event_stream = EventStream()

# Event type constants
EVENT_AGENT_STARTED = "agent_started"
EVENT_AGENT_FINISHED = "agent_finished"
EVENT_INSIGHT_GENERATED = "insight_generated"
EVENT_SIGNAL_DETECTED = "signal_detected"
EVENT_REASONING_UPDATED = "reasoning_updated"
EVENT_PREDICTION_MADE = "prediction_made"
EVENT_CONFIDENCE_CHANGED = "confidence_changed"
EVENT_NETWORK_SIGNAL = "network_signal_received"
