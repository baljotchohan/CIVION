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
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Register Routes ─────────────────────────────────
from civion.api.routes import (
    goals, agents, signals, insights, predictions,
    personas, reasoning, network, events, memory,
    marketplace, system, assistant, nick, vault,
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
app.include_router(assistant.router, prefix=API_PREFIX)
app.include_router(nick.router,      prefix=f"{API_PREFIX}/nick",      tags=["nick"])
app.include_router(vault.router,     prefix=f"{API_PREFIX}/vault",     tags=["vault"])


# ── Root & Legacy Endpoints ─────────────────────────
# Root handler moved to static mount at the end


@app.get("/api/status")
async def legacy_status():
    """Legacy status endpoint (backward compat)."""
    return {"status": "online", "version": "2.0.0-ultimate"}


# ── WebSocket ────────────────────────────────────────
@app.websocket("/ws")
@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str = "default"):
    """WebSocket endpoint for real-time updates"""
    try:
        await manager.connect(websocket, client_id)
        while True:
            # Keep connection alive, listen for messages
            data_str = await websocket.receive_text()
            await manager.handle_client_message(websocket, data_str)
    except WebSocketDisconnect:
        manager.disconnect(websocket)


# ── Static Files & Frontend ─────────────────────────
from fastapi.staticfiles import StaticFiles
from pathlib import Path

# Serve bundled frontend
static_path = Path(__file__).parent.parent / "static" / "ui"
if static_path.exists():
    # Mount specific subdirectories first for direct access
    if (static_path / "_next").exists():
        app.mount("/_next", StaticFiles(directory=str(static_path / "_next")), name="nextjs")
    if (static_path / "static").exists():
        app.mount("/static", StaticFiles(directory=str(static_path / "static")), name="static_assets")
    
    # Root handler for the main index page
    @app.get("/")
    async def serve_index():
        index_file = static_path / "index.html"
        if index_file.exists():
            from fastapi.responses import FileResponse
            return FileResponse(index_file)
        return {"status": "online", "message": "UI found but index.html missing"}
    
    # Catch-all for any other files in the static root
    app.mount("/", StaticFiles(directory=str(static_path), html=True), name="frontend")
else:
    @app.get("/")
    async def root():
        from fastapi.responses import HTMLResponse
        html_content = """
        <html>
            <head>
                <title>CIVION - UI Not Found</title>
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #f3f4f6; color: #1f2937; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
                    .card { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 500px; text-align: center; }
                    h1 { color: #dc2626; margin-top: 0; }
                    p { line-height: 1.5; color: #4b5563; }
                    code { background: #f3f4f6; padding: 0.2rem 0.4rem; border-radius: 4px; font-family: monospace; color: #ef4444; }
                </style>
            </head>
            <body>
                <div class="card">
                    <h1>UI Bundle Not Found</h1>
                    <p>The CIVION backend is running, but the frontend static files were not found.</p>
                    <p>If you cloned this repository from source, you must build the frontend before it can be served. Open a new terminal and run:</p>
                    <p><code>./scripts/build_frontend.sh</code></p>
                    <p>Or, if you are on Windows, ensure you have Node.js installed, navigate to the <code>ui</code> folder, and run <code>npm install</code> followed by <code>npm run build</code>.</p>
                </div>
            </body>
        </html>
        """
        return HTMLResponse(content=html_content)

# ── Error Handlers ───────────────────────────────────
# (Keep existing handlers but adjust for SPA if needed)
@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    # If API request, return JSON
    if request.url.path.startswith("/api"):
        return JSONResponse(
            status_code=404,
            content={"error": "Not found", "path": str(request.url.path)},
        )
    
    # If frontend request and index.html exists, return it (client-side routing)
    index_file = static_path / "index.html"
    if index_file.exists():
        from fastapi.responses import FileResponse
        return FileResponse(index_file)
        
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
