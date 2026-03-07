"""
CIVION API Server
FastAPI application with 60+ endpoints, WebSocket, and OpenAPI docs.
"""
from __future__ import annotations
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from civion.core.config import settings
from civion.core.logger import get_logger, print_banner
from civion.engine.agent_engine import agent_engine, register_default_agents
from civion.engine.event_stream import event_stream
from civion.api.websocket import manager


log = get_logger("api")


# ── Lifespan ─────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: startup and shutdown."""
    print_banner()
    log.info("[green]CIVION API starting...[/green]")

    # Register all default agents
    register_default_agents()
    log.info(f"Registered {agent_engine.total_count} agents")

    # Start all agents
    await agent_engine.start_all()

    yield

    # Shutdown
    log.info("[yellow]CIVION API shutting down...[/yellow]")
    await agent_engine.stop_all()


# ── App ──────────────────────────────────────────────
app = FastAPI(
    title="CIVION v2 - AI Intelligence Command Center",
    description="Production-grade multi-agent intelligence platform with reasoning, predictions, personas, and P2P networking.",
    version="2.0.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# ── CORS ─────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Register Routes ─────────────────────────────────
from civion.api.routes import (
    goals, agents, signals, insights, predictions,
    personas, reasoning, network, events, memory,
    marketplace, system,
)

API_PREFIX = "/api/v1"
app.include_router(goals.router, prefix=API_PREFIX)
app.include_router(agents.router, prefix=API_PREFIX)
app.include_router(signals.router, prefix=API_PREFIX)
app.include_router(insights.router, prefix=API_PREFIX)
app.include_router(predictions.router, prefix=API_PREFIX)
app.include_router(personas.router, prefix=API_PREFIX)
app.include_router(reasoning.router, prefix=API_PREFIX)
app.include_router(network.router, prefix=API_PREFIX)
app.include_router(events.router, prefix=API_PREFIX)
app.include_router(memory.router, prefix=API_PREFIX)
app.include_router(marketplace.router, prefix=API_PREFIX)
app.include_router(system.router, prefix=API_PREFIX)


# ── Root & Legacy Endpoints ─────────────────────────
@app.get("/")
async def root():
    return {
        "name": "CIVION",
        "version": "2.0.0",
        "status": "online",
        "docs": "/api/docs",
        "api": "/api/v1",
    }


@app.get("/api/status")
async def legacy_status():
    """Legacy status endpoint (backward compat)."""
    return {"status": "online", "version": "2.0.0-ultimate"}


# ── WebSocket ────────────────────────────────────────
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time updates"""
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive, listen for messages
            data = await websocket.receive_text()
            
            # Client can send ping to keep alive
            if data == "ping":
                await websocket.send_json({"type": "pong"})
    except WebSocketDisconnect:
        manager.disconnect(websocket)


# ── Error Handlers ───────────────────────────────────
@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    return JSONResponse(
        status_code=404,
        content={"error": "Not found", "path": str(request.url.path)},
    )


@app.exception_handler(500)
async def server_error_handler(request: Request, exc):
    log.error(f"Server error: {exc}")
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error"},
    )
