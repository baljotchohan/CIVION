import json
import asyncio
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from civion.services.assistant_context import AssistantContextBuilder
from civion.services.llm_service import LLMService
from civion.core.config import CivionConfig

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

ARIA_SYSTEM_PROMPT = """You are ARIA (Adaptive Reasoning Intelligence 
Assistant), the built-in AI assistant for CIVION v2 — an AI Intelligence
Command Center.

CURRENT SYSTEM STATE:
- Health: {health}
- Active Agents: {active_agents}
- Agents Running: {agents_running}/{agents_total}
- Recent Signals: {signal_count} signals detected
- Avg Confidence: {confidence_avg}
- Network Peers: {network_peers}
- Uptime: {uptime}
- API Keys Configured: {api_keys}

RECENT SIGNALS:
{recent_signals}

RECENT PREDICTIONS:
{recent_predictions}

You help users with:
1. Understanding CIVION features and how they work
2. Explaining what agents are currently doing
3. Interpreting signals, confidence scores, and predictions
4. Executing commands (you can trigger actions)
5. Troubleshooting configuration and agent issues
6. Answering questions about the data you can see above

AVAILABLE ACTIONS (include as JSON at end of response when relevant):
When you want to execute an action, end your response with:
<actions>
[{{"type": "start_agent", "agent_id": "github"}}]
</actions>

Available action types:
- start_agent: {{"type": "start_agent", "agent_id": "<id>"}}
- stop_agent: {{"type": "stop_agent", "agent_id": "<id>"}}
- create_goal: {{"type": "create_goal", "title": "<goal text>"}}
- navigate: {{"type": "navigate", "page": "<page name>"}}
- open_settings: {{"type": "open_settings"}}

PERSONALITY:
- Helpful, precise, slightly futuristic in tone
- Use technical language but always explain clearly
- Keep responses concise (2-4 paragraphs max) unless asked for detail
- Never make up data — only reference what is in your context above
- If system is dead/idle, guide user to Settings to configure API keys
- Always be honest about what you know vs don't know

Format responses in plain text. No markdown headers. 
Use short paragraphs. Be direct and useful."""

def build_prompt(context: dict, message: str) -> str:
    """Inject real context values into system prompt"""
    signals_text = "\n".join([
        f"- [{s.get('source','?')}] {s.get('title','?')} "
        f"(confidence: {s.get('confidence',0):.0%})"
        for s in context.get('recent_signals', [])[:5]
    ]) or "No recent signals"
    
    predictions_text = "\n".join([
        f"- {p.get('title','?')} "
        f"({p.get('probability',0):.0%} probability)"
        for p in context.get('recent_predictions', [])[:3]
    ]) or "No recent predictions"
    
    api_keys = context.get('api_keys_configured', {})
    keys_text = ", ".join([
        k for k, v in api_keys.items() if v
    ]) or "None configured"
    
    return ARIA_SYSTEM_PROMPT.format(
        health=context.get('system_health', 'unknown'),
        active_agents=context.get('active_agents', []),
        agents_running=context.get('agents_running', 0),
        agents_total=context.get('agents_total', 0),
        signal_count=context.get('signal_count', 0),
        confidence_avg=f"{context.get('confidence_avg', 0):.0%}",
        network_peers=context.get('network_peers', 0),
        uptime=context.get('uptime', 'unknown'),
        api_keys=keys_text,
        recent_signals=signals_text,
        recent_predictions=predictions_text,
    )

def parse_actions(text: str) -> tuple[str, list]:
    """Extract <actions> block from LLM response"""
    actions = []
    clean_text = text
    
    if '<actions>' in text and '</actions>' in text:
        start = text.index('<actions>')
        end = text.index('</actions>') + len('</actions>')
        actions_str = text[start+9:end-10].strip()
        clean_text = (text[:start] + text[end:]).strip()
        
        try:
            actions = json.loads(actions_str)
        except json.JSONDecodeError:
            pass
    
    return clean_text, actions

@router.post("/chat")
async def chat_stream(payload: ChatMessagePayload):
    """Real streaming endpoint — calls LLMService with full context"""
    
    async def event_generator():
        try:
            # Build real context
            full_context = await context_builder.build_context()
            system_prompt = build_prompt(full_context, payload.message)
            
            # Build conversation messages
            messages = []
            if payload.history:
                for h in payload.history[-10:]:  # last 10 messages
                    messages.append({
                        "role": h.get("role", "user"),
                        "content": h.get("content", "")
                    })
            messages.append({
                "role": "user",
                "content": payload.message
            })
            
            # Call real LLM with streaming
            llm = LLMService()
            full_response = ""
            
            async for token in llm.stream(
                prompt=payload.message,
                system=system_prompt,
                messages=messages,
                max_tokens=1024,
                temperature=0.7
            ):
                full_response += token
                yield f"data: {json.dumps({'token': token, 'done': False})}\n\n"
            
            # Parse actions from full response
            clean_text, actions = parse_actions(full_response)
            
            # If actions were embedded, update last token
            yield f"data: {json.dumps({'token': '', 'done': True, 'actions': actions})}\n\n"
            
        except Exception as e:
            error_msg = f"ARIA encountered an error: {str(e)}"
            if "api" in str(e).lower() or "key" in str(e).lower():
                error_msg = ("I cannot connect to the LLM service. "
                           "Please check your API key in Settings.")
            elif "model" in str(e).lower():
                error_msg = ("The configured model is unavailable. "
                           "Try changing it in Settings.")
            
            # Stream error message token by token
            for word in error_msg.split():
                yield f"data: {json.dumps({'token': word + ' ', 'done': False})}\n\n"
                await asyncio.sleep(0.03)
            
            yield f"data: {json.dumps({'token': '', 'done': True, 'actions': []})}\n\n"
    
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        }
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
                results.append({
                    "action": a_type,
                    "success": True,
                    "message": f"Started agent: {action.get('agent_id')}"
                })
            elif a_type == "stop_agent":
                from civion.engine.agent_controller import AgentController
                ctrl = AgentController()
                await ctrl.stop_agent(action.get("agent_id"))
                results.append({
                    "action": a_type,
                    "success": True,
                    "message": f"Stopped agent: {action.get('agent_id')}"
                })
            elif a_type == "create_goal":
                results.append({
                    "action": a_type,
                    "success": True,
                    "message": f"Goal queued: {action.get('title')}"
                })
            else:
                results.append({
                    "action": a_type,
                    "success": True,
                    "message": f"Action acknowledged: {a_type}"
                })
        except Exception as e:
            results.append({
                "action": a_type,
                "success": False,
                "message": str(e)
            })
    
    return {"results": results}
