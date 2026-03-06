"""
CIVION — FastAPI Server
REST API + SPA dashboard at http://localhost:8000

Full endpoint list:
  Dashboard:    GET  /
  Agents:       GET  /api/agents          POST /api/agents/{name}/run
                POST /api/agents/{name}/stop  DELETE /api/agents/{name}
  Insights:     GET  /api/insights
  Logs:         GET  /api/logs
  Runs:         GET  /api/runs
  Signals:      GET  /api/signals
  Memory:       GET  /api/memory          GET  /api/memory/search
  Events:       GET  /api/events
  Files:        GET  /api/files           GET  /api/files/{path}
                DELETE /api/files/{path}
  Connections:  GET  /api/connections      POST /api/connections
                POST /api/connections/{name}/test  DELETE /api/connections/{name}
  Providers:    GET  /api/providers        POST /api/providers
                POST /api/providers/{name}/test  DELETE /api/providers/{name}
  System:       GET  /api/system/status
  Builder:      POST /api/builder/generate
"""

from __future__ import annotations

import logging
import os
import textwrap
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any

import httpx
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from civion.engine.agent_engine import engine
from civion.services.logging_service import configure_logging
from civion.storage.database import (
    get_insights, get_logs, get_runs, get_world_events, init_db,
    get_connections, save_connection, update_connection_status, delete_connection,
    get_providers, save_provider, update_provider_status, delete_provider,
    update_agent_status, delete_agent_db,
)

logger = logging.getLogger("civion.server")

_DIR = Path(__file__).resolve().parent
_TEMPLATES = _DIR / "templates"
_STATIC = _DIR / "static"
_DATA = Path(__file__).resolve().parent.parent.parent / "data"
_TEMPLATES.mkdir(parents=True, exist_ok=True)
_STATIC.mkdir(parents=True, exist_ok=True)
_DATA.mkdir(parents=True, exist_ok=True)


@asynccontextmanager
async def lifespan(application: FastAPI):
    configure_logging()
    await init_db()
    await engine.startup()
    
    from civion.engine.scheduler import AgentScheduler
    from civion.config.settings import settings
    
    scheduler = AgentScheduler(engine)
    scheduler.schedule_agents()
    scheduler.start()
    
    if settings.agents.auto_start:
        import asyncio
        asyncio.create_task(engine.run_all_agents())
        
    logger.info("CIVION server started")
    yield
    scheduler.stop()
    logger.info("CIVION server stopped")


app = FastAPI(title="CIVION", version="0.3.0", lifespan=lifespan)
app.mount("/static", StaticFiles(directory=str(_STATIC)), name="static")
templates = Jinja2Templates(directory=str(_TEMPLATES))


# ── Dashboard ─────────────────────────────────────────────────

@app.get("/", response_class=HTMLResponse)
async def dashboard(request: Request):
    return templates.TemplateResponse("dashboard.html", {"request": request})


# ── System Status ─────────────────────────────────────────────

@app.get("/api/system/status")
async def api_system_status():
    agents = engine.list_agents()
    insights = await get_insights(1000)
    runs = await get_runs(1000)
    logs = await get_logs(1000)
    events = await get_world_events(1000)
    return {
        "agents_total": len(agents),
        "agents_running": sum(1 for a in agents if True),
        "insights_total": len(insights),
        "runs_total": len(runs),
        "events_total": len(events),
        "errors_total": sum(1 for l in logs if l.get("level") == "ERROR"),
        "uptime": "Active",
    }


# ── Agents ────────────────────────────────────────────────────

@app.get("/api/agents")
async def api_agents():
    return engine.list_agents()

@app.post("/api/agents/{name}/run")
async def api_run_agent(name: str):
    result = await engine.run_agent(name)
    if result is None:
        return JSONResponse({"error": f"Agent '{name}' not found"}, 404)
    return {"success": result.success, "title": result.title, "content": result.content[:2000]}

@app.post("/api/agents/{name}/stop")
async def api_stop_agent(name: str):
    await update_agent_status(name, "stopped")
    return {"status": "stopped", "agent": name}

@app.post("/api/agents/{name}/start")
async def api_start_agent(name: str):
    await update_agent_status(name, "running")
    return {"status": "running", "agent": name}

@app.delete("/api/agents/{name}")
async def api_delete_agent(name: str):
    await delete_agent_db(name)
    return {"deleted": name}


# ── Insights ──────────────────────────────────────────────────

@app.get("/api/insights")
async def api_insights(limit: int = 50):
    return await get_insights(limit)


# ── Logs ──────────────────────────────────────────────────────

@app.get("/api/logs")
async def api_logs(limit: int = 200):
    return await get_logs(limit)


# ── Runs ──────────────────────────────────────────────────────

@app.get("/api/runs")
async def api_runs(limit: int = 50):
    return await get_runs(limit)


# ── Signals ───────────────────────────────────────────────────

@app.get("/api/signals")
async def api_signals(limit: int = 20):
    from civion.engine.collaboration_engine import get_signals
    return await get_signals(limit)


# ── Memory ────────────────────────────────────────────────────

@app.get("/api/memory")
async def api_memory():
    from civion.services.memory_graph import get_memory_graph
    return await get_memory_graph(limit=50)

@app.get("/api/memory/search")
async def api_memory_search(q: str = "", agent: str = "", limit: int = 20):
    from civion.services.memory_graph import search_insights
    return await search_insights(query=q, agent_name=agent, limit=limit)


# ── Events ────────────────────────────────────────────────────

@app.get("/api/events")
async def api_events(limit: int = 100):
    return await get_world_events(limit)


# ── Files ─────────────────────────────────────────────────────

@app.get("/api/files")
async def api_files():
    files = []
    for root, dirs, filenames in os.walk(str(_DATA)):
        for f in filenames:
            if f.startswith(".") or f.endswith(".db"):
                continue
            full = Path(root) / f
            rel = full.relative_to(_DATA)
            stat = full.stat()
            files.append({
                "name": f,
                "path": str(rel),
                "size": stat.st_size,
                "modified": stat.st_mtime,
                "type": full.suffix.lstrip(".") or "file",
            })
    return sorted(files, key=lambda x: x["modified"], reverse=True)

@app.get("/api/files/{path:path}")
async def api_file_content(path: str):
    filepath = _DATA / path
    if not filepath.exists() or not filepath.is_file():
        return JSONResponse({"error": "File not found"}, 404)
    try:
        content = filepath.read_text(encoding="utf-8")
        return {"name": filepath.name, "path": path, "content": content}
    except Exception:
        return {"name": filepath.name, "path": path, "content": "[binary file]"}

@app.delete("/api/files/{path:path}")
async def api_delete_file(path: str):
    filepath = _DATA / path
    if filepath.exists() and filepath.is_file():
        filepath.unlink()
        return {"deleted": path}
    return JSONResponse({"error": "File not found"}, 404)


# ── API Connections ───────────────────────────────────────────

@app.get("/api/connections")
async def api_connections():
    return await get_connections()

@app.post("/api/connections")
async def api_add_connection(request: Request):
    data = await request.json()
    await save_connection(
        name=data["name"], url=data.get("url", ""),
        api_key=data.get("api_key", ""), icon=data.get("icon", "🔌"),
    )
    return {"saved": data["name"]}

@app.post("/api/connections/{name}/test")
async def api_test_connection(name: str):
    conns = await get_connections()
    conn = next((c for c in conns if c["name"] == name), None)
    if not conn:
        return JSONResponse({"error": "Connection not found"}, 404)
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            headers = {"Authorization": f"Bearer {conn['api_key']}"} if conn["api_key"] else {}
            resp = await client.get(conn["url"], headers=headers)
            ok = resp.status_code < 400
        status = "connected" if ok else "error"
        await update_connection_status(name, status)
        return {"name": name, "status": status, "code": resp.status_code}
    except Exception as exc:
        await update_connection_status(name, "error")
        return {"name": name, "status": "error", "error": str(exc)}

@app.delete("/api/connections/{name}")
async def api_delete_connection(name: str):
    await delete_connection(name)
    return {"deleted": name}


# ── LLM Providers ────────────────────────────────────────────

@app.get("/api/providers")
async def api_providers():
    return await get_providers()

@app.post("/api/providers")
async def api_add_provider(request: Request):
    data = await request.json()
    await save_provider(
        name=data["name"], provider=data.get("provider", "ollama"),
        model=data.get("model", ""), api_key=data.get("api_key", ""),
        url=data.get("url", ""), is_default=data.get("is_default", False),
    )
    return {"saved": data["name"]}

@app.post("/api/providers/{name}/test")
async def api_test_provider(name: str):
    provs = await get_providers()
    prov = next((p for p in provs if p["name"] == name), None)
    if not prov:
        return JSONResponse({"error": "Provider not found"}, 404)
    try:
        if prov["provider"] == "ollama":
            url = prov["url"] or "http://localhost:11434"
            async with httpx.AsyncClient(timeout=10) as client:
                resp = await client.get(f"{url}/api/tags")
                ok = resp.status_code < 400
        elif prov["provider"] == "openai":
            from openai import AsyncOpenAI
            client = AsyncOpenAI(api_key=prov["api_key"])
            models = await client.models.list()
            ok = True
        else:
            ok = False

        status = "connected" if ok else "error"
        await update_provider_status(name, status)
        return {"name": name, "status": status}
    except Exception as exc:
        await update_provider_status(name, "error")
        return {"name": name, "status": "error", "error": str(exc)}

@app.delete("/api/providers/{name}")
async def api_delete_provider(name: str):
    await delete_provider(name)
    return {"deleted": name}


# ── Agent Builder ─────────────────────────────────────────────

@app.post("/api/builder/generate")
async def api_builder_generate(request: Request):
    data = await request.json()
    name = data.get("name", "my_agent")
    desc = data.get("description", "A custom CIVION agent")
    personality = data.get("personality", "Explorer")
    interval = data.get("interval", 3600)
    sources = data.get("data_sources", [])

    snake = name.lower().replace("-", "_").replace(" ", "_")
    class_name = "".join(w.capitalize() for w in snake.split("_"))
    if not class_name.endswith("Agent"):
        class_name += "Agent"

    sources_str = ", ".join(f'"{s}"' for s in sources) if sources else '"https://api.example.com/data"'

    code = textwrap.dedent(f'''\
        """
        CIVION Agent — {class_name}
        {desc}
        """

        from civion.agents.base_agent import BaseAgent, AgentResult
        from civion.services.api_service import api
        from civion.services.llm_service import llm


        class {class_name}(BaseAgent):
            name = "{snake}"
            description = "{desc}"
            interval = {interval}
            personality = "{personality}"
            tags = ["custom"]
            data_sources = [{sources_str}]

            async def run(self) -> AgentResult:
                # Fetch data
                data = await api.get(self.data_sources[0])

                # Analyse with LLM
                analysis = await llm.generate(
                    prompt=f"Analyse this data: {{data}}",
                    system=self.personality_prompt(),
                )

                return AgentResult(
                    success=True,
                    title="{class_name} Result",
                    content=analysis,
                    events=[],
                )
    ''')

    # Write to agents directory
    agents_dir = Path(__file__).resolve().parent.parent / "agents"
    filepath = agents_dir / f"{snake}.py"
    if not filepath.exists():
        filepath.write_text(code)

    return {"name": snake, "class_name": class_name, "code": code, "path": str(filepath)}
