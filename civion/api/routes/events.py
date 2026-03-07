"""Event API routes."""
from fastapi import APIRouter
from typing import Optional
from civion.engine.event_stream import event_stream
from civion.services.data_service import data_service

router = APIRouter(prefix="/events", tags=["Events"])


@router.get("")
async def list_events(limit: int = 50, event_type: Optional[str] = None):
    """List recent events."""
    return event_stream.get_recent_events(limit=limit, event_type=event_type)


@router.get("/stream-info")
async def stream_info():
    """Get event stream info."""
    return {
        "ws_connections": event_stream.connection_count,
        "recent_events": len(event_stream.get_recent_events()),
    }


@router.get("/history")
async def event_history(limit: int = 100):
    """Get event history from persistence."""
    return await data_service.get_events(limit=limit)
