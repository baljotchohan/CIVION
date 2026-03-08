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
    keys_set = any(_config_store["api_keys"].values())
    agents_running = 0 # Currently mocked to 0 to show IDLE state initially
    
    if not keys_set:
        health = "dead"
    elif agents_running == 0:
        health = "idle"
    else:
        health = "alive"
        
    return {
        "health": health,
        "backend_online": True,
        "api_keys": _config_store["api_keys"],
        "agents_running": agents_running,
        "agents_total": 7,
        "ws_clients": 0,  # We would inject real ConnectionManager stats here
        "uptime_seconds": int(time.time() - SYSTEM_START_TIME),
        "version": "2.0.0"
    }

@router.get("/stats")
def get_system_stats() -> Dict[str, Any]:
    current_uptime = int(time.time() - SYSTEM_START_TIME)
    
    return {
        "active_agents": 4,          
        "signals_today": 128,        
        "predictions_made": 24,      
        "network_peers": 12,         
        "uptime_seconds": current_uptime,
        "confidence_avg": 0.85,      
        "version": "2.0.0"
    }

@router.get("/config")
def get_system_config() -> Dict[str, Any]:
    return {
        "environment": "development",
        "llm_provider": "claude",
        "log_level": "INFO",
        "features": {
            "network_sharing": True,
            "mock_mode": True
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
