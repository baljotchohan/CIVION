import asyncio
import logging
from typing import List, Optional
from uuid import uuid4
from datetime import datetime, timezone

from civion.api.websocket import manager

logger = logging.getLogger(__name__)

class SignalEngine:
    """Processes, filters, and correlates raw signals."""
    
    def __init__(self):
        self.signals = []
        self._lock = asyncio.Lock()

    async def process_signal(self, source: str, data: dict, confidence: float) -> dict:
        """Process an incoming signal and broadcast it to connected UI clients."""
        signal_id = f"sig_{uuid4().hex[:8]}"
        
        signal = {
            "id": signal_id,
            "source": source,
            "title": data.get("title", f"Event from {source}"),
            "description": data.get("description", str(data)),
            "confidence": confidence,
            "strength": data.get("strength", confidence),
            "signal_type": data.get("type", "generic"),
            "timestamp": datetime.now(timezone.utc).isoformat() + "Z",
            "evidence": data.get("evidence", []),
            "tags": data.get("tags", []),
            "url": data.get("url", None)
        }
        
        async with self._lock:
            self.signals.append(signal)
            
        logger.info(f"SignalEngine processed signal: {signal_id} from {source}")
        
        # Broadcast via WebSocket precisely as specified in the instructions
        await manager.broadcast("signal_detected", signal)
        
        return signal
        
    async def get_recent_signals(self, limit: int = 50) -> List[dict]:
        async with self._lock:
            # Return newest first
            return sorted(self.signals, key=lambda x: x["timestamp"], reverse=True)[:limit]

signal_engine = SignalEngine()
