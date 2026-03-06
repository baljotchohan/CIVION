"""
CIVION — FastAPI Server
REST API + Jinja2 dashboard at http://localhost:8000

Endpoints:
  GET  /              → Dashboard
  GET  /api/agents    → List agents
  GET  /api/insights  → Latest insights
  GET  /api/logs      → Structured logs
  GET  /api/runs      → Run history
  GET  /api/signals   → Collaboration signals
  GET  /api/memory    → Knowledge graph data
  GET  /api/events    → World map events
  POST /api/agents/{name}/run → Trigger agent
"""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any

from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from civion.engine.agent_engine import engine
from civion.services.logging_service import configure_logging
from civion.storage.database import (
    get_insights,
    get_logs,
    get_runs,
    get_world_events,
    init_db,
)

logger = logging.getLogger("civion.server")

# ── Paths ─────────────────────────────────────────────────────

_DIR = Path(__file__).resolve().parent
_TEMPLATES = _DIR / "templates"
_STATIC = _DIR / "static"
_TEMPLATES.mkdir(parents=True, exist_ok=True)
_STATIC.mkdir(parents=True, exist_ok=True)


# ── App lifecycle ─────────────────────────────────────────────

@asynccontextmanager
async def lifespan(application: FastAPI):
    configure_logging()
    await init_db()
    await engine.startup()
    logger.info("CIVION server started")
    yield
    logger.info("CIVION server stopped")


app = FastAPI(
    title="CIVION",
    description="Local AI Agent Operating System",
    version="0.2.0",
    lifespan=lifespan,
)

app.mount("/static", StaticFiles(directory=str(_STATIC)), name="static")
templates = Jinja2Templates(directory=str(_TEMPLATES))


# ── Dashboard ─────────────────────────────────────────────────

@app.get("/", response_class=HTMLResponse)
async def dashboard(request: Request):
    return templates.TemplateResponse("dashboard.html", {"request": request})


# ── Core API ──────────────────────────────────────────────────

@app.get("/api/agents")
async def api_agents() -> list[dict[str, Any]]:
    return engine.list_agents()


@app.get("/api/insights")
async def api_insights(limit: int = 50) -> list[dict[str, Any]]:
    return await get_insights(limit)


@app.get("/api/logs")
async def api_logs(limit: int = 100) -> list[dict[str, Any]]:
    return await get_logs(limit)


@app.get("/api/runs")
async def api_runs(limit: int = 50) -> list[dict[str, Any]]:
    return await get_runs(limit)


@app.post("/api/agents/{name}/run")
async def api_run_agent(name: str):
    result = await engine.run_agent(name)
    if result is None:
        return JSONResponse({"error": f"Agent '{name}' not found"}, status_code=404)
    return {
        "success": result.success,
        "title": result.title,
        "content": result.content[:2000],
    }


# ── Memory Graph ──────────────────────────────────────────────

@app.get("/api/memory")
async def api_memory():
    from civion.services.memory_graph import get_memory_graph
    return await get_memory_graph(limit=50)


@app.get("/api/memory/search")
async def api_memory_search(q: str = "", agent: str = "", limit: int = 20):
    from civion.services.memory_graph import search_insights
    return await search_insights(query=q, agent_name=agent, limit=limit)


# ── Collaboration Signals ────────────────────────────────────

@app.get("/api/signals")
async def api_signals(limit: int = 20):
    from civion.engine.collaboration_engine import get_signals
    return await get_signals(limit)


# ── World Events ─────────────────────────────────────────────

@app.get("/api/events")
async def api_events(limit: int = 100):
    return await get_world_events(limit)
