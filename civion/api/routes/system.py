"""System API routes."""
from fastapi import APIRouter
from civion.services.data_service import data_service
from civion.services.cache_service import cache_service
from civion.engine.agent_engine import agent_engine
from civion.services.api_key_manager import api_key_manager

router = APIRouter(prefix="/system", tags=["System"])


@router.get("/status")
async def system_status():
    """Get complete system status."""
    return {
        "status": "online",
        "version": "2.0.0",
        "agents": agent_engine.get_stats(),
        "data": await data_service.get_stats(),
        "cache": await cache_service.get_stats(),
    }


@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "version": "2.0.0"}


@router.get("/config")
async def get_config():
    """Get current configuration (safe values only)."""
    from civion.core.config import settings
    return {
        "host": settings.host,
        "port": settings.port,
        "llm_provider": settings.llm_provider,
        "autonomous_enabled": settings.autonomous_enabled,
        "network_enabled": settings.network_enabled,
        "api_keys": api_key_manager.list_services(),
    }


@router.get("/stats")
async def system_stats():
    """Get comprehensive system statistics."""
    return {
        "data": await data_service.get_stats(),
        "cache": await cache_service.get_stats(),
        "agents": agent_engine.get_stats(),
        "memory": await __import__('civion.services.memory_service', fromlist=['memory_service']).memory_service.get_stats(),
    }


@router.get("/tools")
async def list_tools():
    """List available tools."""
    from civion.tools.tool_manager import tool_manager
    return tool_manager.list_tools()
