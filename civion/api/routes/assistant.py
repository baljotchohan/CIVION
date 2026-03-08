import json
import asyncio
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from civion.services.assistant_context import AssistantContextBuilder
from civion.services.llm_service import LLMService
from civion.core.config import CivionConfig
from civion.api.routes.nick import get_user_profile, get_nick_memory
from civion.services.file_service import file_service

router = APIRouter(prefix="/assistant", tags=["Assistant"])
context_builder = AssistantContextBuilder()
config = CivionConfig()

class ChatMessagePayload(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    context: Optional[Dict[str, Any]] = None
    history: Optional[List[Dict[str, str]]] = None

class ActionPayload(BaseModel):
    actions: List[Dict[str, Any]]

class FileActionPayload(BaseModel):
    action: str
    path: str
    content: Optional[str] = None

NICK_SYSTEM_PROMPT = """You are NICK, a friendly and intelligent personal assistant built into CIVION.

USER PROFILE:
  Name: {name}
  Occupation: {occupation}
  Interests: {interests}
  Experience: {experience_level}

CURRENT SYSTEM STATE:
  Health: {health}
  Active agents: {active_agents}
  Agents Running: {agents_running}/{agents_total}
  Recent signals: {recent_signals}
  Latest predictions: {recent_predictions}
  Confidence avg: {confidence_avg}

CONVERSATION MEMORY:
  Facts: {recent_facts_about_user}
  Notable events: {previous_notable_conversations}

You can take actions by including JSON at end:
<actions>[{{"type": "start_agent", "agent_id": "github"}}]</actions>

You can read/write files:
<file_action>{{"action": "read", "path": "~/Documents/notes.txt"}}</file_action>
Other file actions: write, create, list, delete. Output them as <file_action>...</file_action> and await the user/system to perform them.

Personality: warm, smart, slightly playful. Like a brilliant friend who happens to know everything about AI and technology. Use the user's name occasionally. Reference their interests when relevant. Remember things they tell you.

Keep responses concise. Max 3 paragraphs unless asked for more. Never make up data — only use context provided above."""

def build_prompt(context: dict) -> str:
    profile = get_user_profile() or {}
    memory = get_nick_memory() or {}
    
    signals_text = "\n".join([f"- {s.get('title','?')}" for s in context.get('recent_signals', [])[:3]]) or "None"
    predictions_text = "\n".join([f"- {p.get('title','?')}" for p in context.get('recent_predictions', [])[:3]]) or "None"
    
    return NICK_SYSTEM_PROMPT.format(
        name=profile.get("name", "User"),
        occupation=profile.get("occupation", "Builder"),
        interests=", ".join(profile.get("interests", [])),
        experience_level=profile.get("experience_level", "intermediate"),
        health=context.get('system_health', 'unknown'),
        active_agents=context.get('active_agents', []),
        agents_running=context.get('agents_running', 0),
        agents_total=context.get('agents_total', 0),
        recent_signals=signals_text,
        recent_predictions=predictions_text,
        confidence_avg=f"{context.get('confidence_avg', 0):.0%}",
        recent_facts_about_user=", ".join(memory.get("facts", [])),
        previous_notable_conversations=", ".join(memory.get("notable_events", []))
    )

def parse_blocks(text: str, tag: str) -> tuple[str, list]:
    blocks = []
    clean_text = text
    open_tag = f"<{tag}>"
    close_tag = f"</{tag}>"
    
    while open_tag in clean_text and close_tag in clean_text:
        start = clean_text.index(open_tag)
        end = clean_text.index(close_tag) + len(close_tag)
        block_str = clean_text[start+len(open_tag):end-len(close_tag)].strip()
        clean_text = (clean_text[:start] + clean_text[end:]).strip()
        
        try:
            val = json.loads(block_str)
            if isinstance(val, list):
                blocks.extend(val)
            else:
                blocks.append(val)
        except json.JSONDecodeError:
            pass
            
    return clean_text, blocks

@router.post("/chat")
async def chat_stream(payload: ChatMessagePayload):
    async def event_generator():
        try:
            full_context = await context_builder.build_context()
            system_prompt = build_prompt(full_context)
            
            messages = []
            if payload.history:
                for h in payload.history[-10:]:
                    messages.append({
                        "role": h.get("role", "user"),
                        "content": h.get("content", "")
                    })
            messages.append({
                "role": "user",
                "content": payload.message
            })
            
            llm = LLMService()
            full_response = ""
            
            async for chunk in llm.stream(
                prompt=payload.message,
                system=system_prompt,
                messages=messages,
                max_tokens=1024,
                temperature=0.7
            ):
                token = chunk.get("choices", [{}])[0].get("delta", {}).get("content", "") if isinstance(chunk, dict) else chunk
                if token:
                    full_response += token
                    yield f"data: {json.dumps({'token': token, 'done': False})}\n\n"
            
            clean_text, actions = parse_blocks(full_response, "actions")
            _, file_actions = parse_blocks(full_response, "file_action")
            
            all_actions = actions
            for fa in file_actions:
                fa["type"] = "file_action"
                all_actions.append(fa)
                
            yield f"data: {json.dumps({'token': '', 'done': True, 'actions': all_actions})}\n\n"
            
        except Exception as e:
            error_msg = f"NICK encountered an error: {str(e)}"
            for word in error_msg.split():
                yield f"data: {json.dumps({'token': word + ' ', 'done': False})}\n\n"
                await asyncio.sleep(0.03)
            yield f"data: {json.dumps({'token': '', 'done': True, 'actions': []})}\n\n"
            
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"}
    )

@router.post("/context")
async def get_assistant_context() -> Dict[str, Any]:
    return await context_builder.build_context()

@router.post("/execute")
async def execute_assistant_action(payload: ActionPayload):
    results = []
    for action in payload.actions:
        a_type = action.get("type")
        try:
            if a_type == "start_agent":
                from civion.engine.agent_controller import AgentController
                ctrl = AgentController()
                await ctrl.start_agent(action.get("agent_id"))
                results.append({"action": a_type, "success": True})
            elif a_type == "stop_agent":
                from civion.engine.agent_controller import AgentController
                ctrl = AgentController()
                await ctrl.stop_agent(action.get("agent_id"))
                results.append({"action": a_type, "success": True})
            elif a_type == "file_action":
                res = await file_action_handler(FileActionPayload(**action))
                results.append({"action": a_type, "success": res["success"]})
            else:
                results.append({"action": a_type, "success": True})
        except Exception as e:
            results.append({"action": a_type, "success": False, "message": str(e)})
    return {"results": results}

@router.post("/file-action")
async def file_action_handler(req: FileActionPayload):
    try:
        data = None
        if req.action == "read":
            data = await file_service.read_file(req.path)
        elif req.action == "write":
            data = await file_service.write_file(req.path, req.content or "")
        elif req.action == "create":
            data = await file_service.create_file(req.path, req.content or "")
        elif req.action == "list":
            data = await file_service.list_directory(req.path)
        elif req.action == "delete":
            data = await file_service.delete_file(req.path)
        else:
            raise Exception("Invalid action")
            
        return {"success": True, "data": data}
    except Exception as e:
        return {"success": False, "error": str(e)}
