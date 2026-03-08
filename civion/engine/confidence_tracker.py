from datetime import datetime
from typing import Dict, List
from civion.models.confidence import ConfidenceUpdate, CascadeEvent

class ConfidenceTracker:
    """Tracks and broadcasts real-time confidence changes for insights."""
    def __init__(self):
        self._confidence_records: Dict[str, ConfidenceUpdate] = {}
        # We would import event_stream here
        # from civion.engine.event_stream import event_stream
    
    async def init_confidence(self, insight_id: str, agent: str, initial_confidence: float):
        """Initialize the confidence tracking for a new insight"""
        update = ConfidenceUpdate(
            insight_id=insight_id,
            agent=agent,
            confidence=initial_confidence,
            cascade_events=[CascadeEvent(agent=agent, confidence=initial_confidence)]
        )
        self._confidence_records[insight_id] = update
        await self._broadcast(update)
        return update

    async def add_verification(self, insight_id: str, agent: str, new_confidence: float):
        """Add a new verification event causing a cascade"""
        if insight_id not in self._confidence_records:
            return None
        
        record = self._confidence_records[insight_id]
        record.confidence = new_confidence
        record.cascade_events.append(CascadeEvent(agent=agent, confidence=new_confidence))
        
        await self._broadcast(record)
        return record

    async def _broadcast(self, update: ConfidenceUpdate):
        """Broadcast over WebSocket"""
        from civion.engine.event_stream import event_stream
        await event_stream.emit("confidence_update", {
            "insight_id": update.insight_id,
            "agent": update.cascade_events[-1].agent,
            "confidence": update.confidence,
            "timestamp": datetime.now().isoformat()
        })

confidence_tracker = ConfidenceTracker()
