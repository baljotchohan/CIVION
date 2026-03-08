from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Any
import time

router = APIRouter(prefix="/system", tags=["System"])

SYSTEM_START_TIME = time.time()

# Dummy in-memory config for testing keys
_config_store = {
    "api_keys": {
        "anthropic": False,
        "openai": False,
        "github": False,
        "arxiv": False,
        "coingecko": False
    }
}

class ConfigPayload(BaseModel):
    key_name: str
    value: str

class TestKeyPayload(BaseModel):
    provider: str
    key: str

@router.get("/status")
def get_system_status() -> Dict[str, str]:
    return {"status": "operational", "version": "2.0.0"}

@router.get("/health")
def get_system_health() -> Dict[str, Any]:
    """Detailed health check for all subsystems, driving Alive vs Dead UI."""
    from civion.engine.agent_engine import agent_engine
    from civion.core.config import settings
    from civion.api.websocket import manager
    
    # Check if any real API keys are configured (not None and not empty)
    api_keys = {
        "openai": bool(settings.openai_api_key),
        "anthropic": bool(settings.anthropic_api_key),
        "google": bool(settings.google_api_key),
        "github": bool(settings.github_token),
    }
    
    keys_set = any(api_keys.values())
    agents_running = agent_engine.active_count
    
    if not keys_set and settings.llm_provider != "mock":
        health = "dead"
    elif agents_running == 0:
        health = "idle"
    else:
        health = "alive"
        
    return {
        "health": health,
        "backend_online": True,
        "api_keys": api_keys,
        "agents_running": agents_running,
        "agents_total": agent_engine.total_count,
        "ws_clients": len(manager.active_connections),
        "uptime_seconds": int(time.time() - SYSTEM_START_TIME),
        "version": "2.0.0"
    }

@router.get("/stats")
async def get_system_stats() -> Dict[str, Any]:
    from civion.engine.agent_engine import agent_engine
    from civion.services.data_service import data_service
    
    current_uptime = int(time.time() - SYSTEM_START_TIME)
    stats = await data_service.get_stats()
    
    return {
        "active_agents": agent_engine.active_count,          
        "signals_today": stats.get("signals", 0),        
        "predictions_made": stats.get("predictions", 0),      
        "network_peers": 0, # P2P not fully implemented in stats yet         
        "uptime_seconds": current_uptime,
        "confidence_avg": 0.85, # Keep this or compute from insights if available      
        "version": "2.0.0"
    }

@router.get("/config")
def get_system_config() -> Dict[str, Any]:
    from civion.core.config import settings
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
    import asyncio
    
    if payload.key_name in _config_store["api_keys"]:
        _config_store["api_keys"][payload.key_name] = bool(payload.value)
    
    # Broadcast config_updated so UI re-fetches health
    try:
        loop = asyncio.get_event_loop()
        loop.create_task(manager.broadcast("config_updated", {"message": "Config updated"}))
    except Exception as e:
        print(f"Failed to broadcast: {e}")
        
    return {"status": "success", "message": f"{payload.key_name} saved"}

@router.post("/test-key")
def test_system_key(payload: TestKeyPayload) -> Dict[str, Any]:
    # Dummy test logic: any key longer than 8 chars is "valid"
    time.sleep(1) # simulate network request
    valid = len(payload.key) > 8
    msg = "Valid API Key" if valid else "Invalid Key length"
    return {"valid": valid, "message": msg}
