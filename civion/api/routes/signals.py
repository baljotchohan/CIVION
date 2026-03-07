"""Signal API routes."""
from fastapi import APIRouter
from typing import Optional
from civion.services.data_service import data_service
from civion.engine.signal_engine import signal_engine

router = APIRouter(prefix="/signals", tags=["Signals"])


@router.get("")
async def list_signals(source: Optional[str] = None, limit: int = 50):
    """List all detected signals."""
    return await data_service.list_signals(source=source, limit=limit)


@router.get("/summary")
async def signal_summary():
    """Get signal summary and statistics."""
    return await signal_engine.get_signal_summary()


@router.get("/patterns")
async def detect_patterns():
    """Detect cross-source patterns."""
    return await signal_engine.detect_patterns()


@router.get("/{signal_id}")
async def get_signal(signal_id: str):
    """Get signal details."""
    from fastapi import HTTPException
    signal = await data_service.get_signal(signal_id)
    if not signal:
        raise HTTPException(404, "Signal not found")
    return signal
