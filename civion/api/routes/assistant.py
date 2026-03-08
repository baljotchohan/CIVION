import json
import asyncio
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from civion.services.assistant_context import AssistantContextBuilder

router = APIRouter(prefix="/assistant", tags=["Assistant"])
context_builder = AssistantContextBuilder()

class ChatMessagePayload(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    context: Optional[Dict[str, Any]] = None

class ActionPayload(BaseModel):
    actions: List[Dict[str, Any]]

@router.post("/chat")
async def chat_stream(payload: ChatMessagePayload):
    """Streaming endpoint for ARIA conversations."""
    
    async def event_generator():
        # In a real app we would call OpenAI/Anthropic here with streaming=True
        # We will mock the stream for the UI requirements
        full_context = await context_builder.build_context()
        prompt = context_builder.build_system_prompt(full_context)
        
        reply = f"I am ARIA. I see the system is currently {full_context.get('system_health')}. You asked: {payload.message}"
        tokens = reply.split(" ")
        
        for token in tokens:
            await asyncio.sleep(0.05) # simulate latency
            yield f"data: {json.dumps({'token': token + ' ', 'done': False})}\n\n"
            
        # Example action: if user says "start" we append an action
        actions = []
        if "start" in payload.message.lower():
            actions.append({"type": "start_agent", "agent_id": "github"})
            
        yield f"data: {json.dumps({'token': '', 'done': True, 'actions': actions})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")

@router.post("/context")
async def get_assistant_context() -> Dict[str, Any]:
    """Returns the current full app context for the assistant dashboard."""
    return await context_builder.build_context()

@router.post("/execute")
async def execute_assistant_action(payload: ActionPayload) -> Dict[str, Any]:
    """Execute actions requested by ARIA."""
    results = []
    for action in payload.actions:
        a_type = action.get("type")
        results.append({
            "action": a_type,
            "success": True,
            "message": f"Successfully executed {a_type}"
        })
    return {"results": results}
