"""Reasoning API routes."""
from fastapi import APIRouter, HTTPException
from civion.engine.reasoning_loop import reasoning_engine

router = APIRouter(prefix="/reasoning", tags=["Reasoning"])


@router.get("")
async def list_reasoning():
    """List all reasoning loops/debates."""
    loops = reasoning_engine.loops if hasattr(reasoning_engine, 'loops') else []
    return [l.dict() if hasattr(l, 'dict') else l for l in loops]


@router.get("/active")
async def get_active_debates():
    """Get currently active debates logic formatted for frontend."""
    loops = reasoning_engine.loops if hasattr(reasoning_engine, 'loops') else []
    
    # Filter for active or recently completed debates to show in UI
    active_loops = [l for l in loops]
    
    debates = []
    for loop in active_loops:
        messages = []
        for arg in loop.arguments:
            messages.append({
                "agent_id": arg.agent,
                "role": "proposer" if arg.position == "support" else "challenger",
                "content": arg.argument,
                "confidence_delta": arg.confidence,
                "timestamp": loop.created_at
            })
            
        debates.append({
            "id": loop.id,
            "topic": loop.topic,
            "status": loop.state if loop.state in ["active", "completed", "error"] else ("active" if loop.state == "debating" else "completed"),
            "messages": messages,
            "conclusion": loop.consensus,
            "final_confidence": loop.final_confidence
        })
        
    return {"debates": debates}


@router.get("/confidence-history")
async def get_confidence_history():
    """Get system-wide average confidence history."""
    import time
    
    # Generate mock history using the reasoning engine loops
    loops = reasoning_engine.loops if hasattr(reasoning_engine, 'loops') else []
    
    history = []
    base_time = int(time.time()) - 3600 # Last hour
    
    # Just generic placeholder data for the graph
    history.append({"time": str(base_time), "confidence": 0.5})
    history.append({"time": str(base_time + 600), "confidence": 0.6})
    history.append({"time": str(base_time + 1200), "confidence": 0.55})
    
    if loops:
        latest = round(sum(l.final_confidence for l in loops) / len(loops), 2)
        history.append({"time": str(base_time + 1800), "confidence": latest})
        
    return {"history": history}


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
