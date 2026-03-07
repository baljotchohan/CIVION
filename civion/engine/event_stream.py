"""
CIVION — Real-time Event Stream
Minimal placeholder for Phase 1. Will be expanded in Phase 2.2.
"""

from typing import Any
import logging

logger = logging.getLogger("civion.event_stream")

class EventStream:
    async def publish(self, event_type: str, payload: dict[str, Any]) -> None:
        """Publish an event to all connected WebSocket clients."""
        try:
            from civion.api.server import manager
            message = {
                "type": event_type,
                "data": payload
            }
            await manager.broadcast(message)
        except ImportError:
            # server may not be started yet in testing
            pass
        except Exception as e:
            logger.error(f"WebSocket publish failed: {e}")

event_stream = EventStream()
