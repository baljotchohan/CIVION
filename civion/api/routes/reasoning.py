"""Reasoning API routes."""
from fastapi import APIRouter, HTTPException
from civion.engine.reasoning_loop import reasoning_engine

router = APIRouter(prefix="/reasoning", tags=["Reasoning"])


@router.get("")
async def list_reasoning():
    """List all reasoning loops/debates."""
    loops = reasoning_engine.loops if hasattr(reasoning_engine, 'loops') else []
    return [l.dict() if hasattr(l, 'dict') else l for l in loops]


@router.get("/{loop_id}")
async def get_reasoning(loop_id: str):
    """Get reasoning loop details."""
    loop = await reasoning_engine.get_loop(loop_id)
    if not loop:
        raise HTTPException(404, "Reasoning loop not found")
    return loop.dict() if hasattr(loop, 'dict') else loop


@router.get("/{loop_id}/debate")
async def get_debate(loop_id: str):
    """Get full debate view for a reasoning loop."""
    loop = await reasoning_engine.get_loop(loop_id)
    if not loop:
        raise HTTPException(404, "Reasoning loop not found")
    return await reasoning_engine.display_reasoning_loop(loop)


@router.post("/start")
async def start_reasoning(topic: str, insight: str = ""):
    """Start a new reasoning debate."""
    loop = await reasoning_engine.start_reasoning_loop(insight or topic, topic)
    return {"id": loop.id, "status": "started", "topic": topic}


@router.post("/{loop_id}/vote")
async def vote_on_conclusion(loop_id: str, agree: bool = True):
    """Vote on a reasoning conclusion."""
    return {"loop_id": loop_id, "vote": "agree" if agree else "disagree", "recorded": True}
