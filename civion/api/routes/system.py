from fastapi import APIRouter, Request
from pydantic import BaseModel
from typing import Dict, Any
import time
import requests
import asyncio
from civion.core.config import settings
from civion.services.llm_service import LLMService

router = APIRouter(prefix="/system", tags=["System"])

SYSTEM_START_TIME = time.time()

class ConfigPayload(BaseModel):
    key_name: str
    value: str

class TestKeyPayload(BaseModel):
    provider: str
    key: str

@router.api_route("/status", methods=["GET", "OPTIONS"])
def get_system_status(request: Request) -> Any:
    from fastapi.responses import JSONResponse
    response = JSONResponse(content={"status": "operational", "version": "2.0.0"})
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, OPTIONS"
    return response

@router.get("/health")
def get_system_health() -> Dict[str, Any]:
    """Detailed health check for all subsystems, driving Alive vs Dead UI."""
    from civion.engine.agent_controller import AgentController
    from civion.api.websocket import manager
    
    agent_controller = AgentController()
    
    api_keys = {
        "openai": bool(settings.openai_api_key),
        "anthropic": bool(settings.anthropic_api_key),
        "google": bool(settings.google_api_key),
        "github": bool(settings.github_token),
    }
    
    keys_set = any(api_keys.values())
    agents_running = agent_controller.get_running_count()
    
    if not keys_set and settings.llm_provider != "mock":
        health = "dead"
    elif agents_running == 0:
        health = "idle"
    else:
        health = "alive"
        
    return {
        "health": health,
        "backend_online": True,
        "websocket": "active",
        "api_keys": api_keys,
        "agents_running": agents_running,
        "agents_total": len(agent_controller.list_agents()),
        "ws_clients": len(manager.active_connections),
        "uptime_seconds": int(time.time() - SYSTEM_START_TIME),
        "version": "2.0.0"
    }

@router.get("/stats")
async def get_system_stats() -> Dict[str, Any]:
    from civion.engine.agent_controller import AgentController
    from civion.engine.signal_engine import signal_engine
    from civion.engine.prediction_engine import prediction_engine
    from civion.engine.network_engine import network_engine
    from civion.engine.reasoning_loop import reasoning_engine
    
    current_uptime = int(time.time() - SYSTEM_START_TIME)
    agent_controller = AgentController()
    
    return {
        "active_agents": agent_controller.get_running_count(),
        "signals_today": signal_engine.get_today_count() if hasattr(signal_engine, 'get_today_count') else len(await signal_engine.get_recent_signals() if hasattr(signal_engine, 'get_recent_signals') else []),
        "predictions_made": prediction_engine.get_total() if hasattr(prediction_engine, 'get_total') else len(await prediction_engine.get_all_predictions() if hasattr(prediction_engine, 'get_all_predictions') else []),
        "network_peers": network_engine.get_peer_count() if hasattr(network_engine, 'get_peer_count') else len(network_engine.peers),
        "network_name": "CIVION Mainnet",
        "uptime_seconds": current_uptime,
        "confidence_avg": reasoning_engine.get_average_confidence() if hasattr(reasoning_engine, 'get_average_confidence') else 0.85,
        "version": "2.0.0"
    }

@router.get("/config")
def get_system_config() -> Dict[str, Any]:
    return {
        "environment": "development" if settings.debug else "production",
        "llm_provider": settings.llm_provider,
        "log_level": "DEBUG" if settings.debug else "INFO",
        "features": {
            "network_sharing": settings.network_enabled,
            "autonomous_mode": settings.autonomous_enabled
        }
    }

@router.post("/config")
def save_system_config(payload: ConfigPayload) -> Dict[str, Any]:
    from civion.api.websocket import manager
    
    # Save key dynamically to settings
    if hasattr(settings, f"{payload.key_name}_api_key"):
        setattr(settings, f"{payload.key_name}_api_key", payload.value)
    
    try:
        loop = asyncio.get_event_loop()
        loop.create_task(manager.broadcast("config_updated", {"message": f"Config updated: {payload.key_name}"}))
    except Exception as e:
        print(f"Failed to broadcast: {e}")
        
    return {"status": "success", "message": f"{payload.key_name} saved"}

@router.post("/test-key")
async def test_system_key(payload: TestKeyPayload) -> Dict[str, Any]:
    start = time.time()
    try:
        if payload.provider.lower() == "ollama":
            # For Ollama, just check API tags
            res = requests.get("http://localhost:11434/api/tags", timeout=5)
            res.raise_for_status()
            latency = int((time.time() - start) * 1000)
            return {"valid": True, "message": "Ollama connection successful", "latency_ms": latency}
        else:
            # For Anthropic/OpenAI/etc., make a real LLM call
            # Temporarily set the key mapping in settings for the test
            old_provider = settings.llm_provider
            settings.llm_provider = payload.provider.lower()
            old_key = getattr(settings, f"{payload.provider.lower()}_api_key", None)
            setattr(settings, f"{payload.provider.lower()}_api_key", payload.key)
            
            svc = LLMService()
            result = await svc.complete("Say 'CIVION connection test successful' and nothing else.", max_tokens=20)
            
            # Revert old settings
            setattr(settings, f"{payload.provider.lower()}_api_key", old_key)
            settings.llm_provider = old_provider
            
            latency = int((time.time() - start) * 1000)
            
            if "successful" in result.lower() or len(result) > 5:
                return {"valid": True, "message": "Connection successful", "latency_ms": latency}
            else:
                return {"valid": False, "message": f"Unexpected response: {result}", "latency_ms": latency}
    except Exception as e:
        latency = int((time.time() - start) * 1000)
        return {"valid": False, "message": str(e), "latency_ms": latency}
