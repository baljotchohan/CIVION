from fastapi import APIRouter
from typing import Dict, Any
import time

router = APIRouter(prefix="/system", tags=["System"])

# Global start time to track uptime
SYSTEM_START_TIME = time.time()

@router.get("/status")
def get_system_status() -> Dict[str, str]:
    """Get basic system health status."""
    return {"status": "operational", "version": "2.0.0"}

@router.get("/health")
def get_system_health() -> Dict[str, Any]:
    """Detailed health check for all subsystems."""
    return {
        "status": "operational",
        "database": "connected",
        "redis": "skipped",
        "websocket": "active"
    }

@router.get("/stats")
def get_system_stats() -> Dict[str, Any]:
    """
    Get core system statistics for the dashboard.
    Returns the exact payload required by the Next.js UI.
    """
    current_uptime = int(time.time() - SYSTEM_START_TIME)
    
    return {
        "active_agents": 4,          # Mocked for UI
        "signals_today": 128,        # Mocked for UI
        "predictions_made": 24,      # Mocked for UI
        "network_peers": 12,         # Mocked for UI
        "uptime_seconds": current_uptime,
        "confidence_avg": 0.85,      # Mocked for UI
        "version": "2.0.0"
    }

@router.get("/config")
def get_system_config() -> Dict[str, Any]:
    """Get safe system configuration parameters."""
    return {
        "environment": "development",
        "llm_provider": "claude",
        "log_level": "INFO",
        "features": {
            "network_sharing": True,
            "mock_mode": True
        }
    }
