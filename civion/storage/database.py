"""
CIVION — SQLite Storage Layer
Async helpers for all CIVION data: agents, runs, insights, logs,
memory graph, collaboration signals, world events, API connections,
and LLM providers.
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import aiosqlite

from civion.config.settings import settings

DB_PATH = Path(settings.database.path)


def _ensure_dir() -> None:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)


_SCHEMA = """
CREATE TABLE IF NOT EXISTS agents (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL UNIQUE,
    description TEXT    NOT NULL DEFAULT '',
    personality TEXT    NOT NULL DEFAULT 'Explorer',
    interval    INTEGER NOT NULL DEFAULT 3600,
    tags        TEXT    NOT NULL DEFAULT '[]',
    status      TEXT    NOT NULL DEFAULT 'stopped',
    registered_at TEXT  NOT NULL
);

CREATE TABLE IF NOT EXISTS agent_runs (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    agent_name  TEXT    NOT NULL,
    started_at  TEXT    NOT NULL,
    finished_at TEXT,
    status      TEXT    NOT NULL DEFAULT 'running',
    result      TEXT
);

CREATE TABLE IF NOT EXISTS insights (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    agent_name  TEXT    NOT NULL,
    title       TEXT    NOT NULL DEFAULT '',
    content     TEXT    NOT NULL,
    created_at  TEXT    NOT NULL
);

CREATE TABLE IF NOT EXISTS logs (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    agent_name  TEXT    NOT NULL,
    level       TEXT    NOT NULL DEFAULT 'INFO',
    message     TEXT    NOT NULL,
    created_at  TEXT    NOT NULL
);

CREATE TABLE IF NOT EXISTS memory_nodes (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    agent_name  TEXT    NOT NULL,
    topic       TEXT    NOT NULL DEFAULT '',
    content     TEXT    NOT NULL,
    tags        TEXT    NOT NULL DEFAULT '[]',
    source      TEXT    NOT NULL DEFAULT '',
    confidence  REAL    NOT NULL DEFAULT 1.0,
    created_at  TEXT    NOT NULL
);

CREATE TABLE IF NOT EXISTS memory_links (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    source_id   INTEGER NOT NULL,
    target_id   INTEGER NOT NULL,
    relation    TEXT    NOT NULL DEFAULT 'related',
    FOREIGN KEY (source_id) REFERENCES memory_nodes(id),
    FOREIGN KEY (target_id) REFERENCES memory_nodes(id)
);

CREATE TABLE IF NOT EXISTS collaboration_signals (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    title           TEXT    NOT NULL,
    description     TEXT    NOT NULL DEFAULT '',
    confidence      REAL    NOT NULL DEFAULT 0.5,
    agents_involved TEXT    NOT NULL DEFAULT '[]',
    supporting_insights TEXT NOT NULL DEFAULT '[]',
    created_at      TEXT    NOT NULL
);

CREATE TABLE IF NOT EXISTS world_events (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    agent_name  TEXT    NOT NULL,
    topic       TEXT    NOT NULL DEFAULT '',
    description TEXT    NOT NULL DEFAULT '',
    latitude    REAL    NOT NULL DEFAULT 0.0,
    longitude   REAL    NOT NULL DEFAULT 0.0,
    location    TEXT    NOT NULL DEFAULT '',
    created_at  TEXT    NOT NULL
);

CREATE TABLE IF NOT EXISTS api_connections (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL UNIQUE,
    url         TEXT    NOT NULL DEFAULT '',
    api_key     TEXT    NOT NULL DEFAULT '',
    status      TEXT    NOT NULL DEFAULT 'disconnected',
    icon        TEXT    NOT NULL DEFAULT '🔌',
    created_at  TEXT    NOT NULL
);

CREATE TABLE IF NOT EXISTS llm_providers (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL UNIQUE,
    provider    TEXT    NOT NULL DEFAULT 'ollama',
    model       TEXT    NOT NULL DEFAULT '',
    api_key     TEXT    NOT NULL DEFAULT '',
    url         TEXT    NOT NULL DEFAULT '',
    is_default  INTEGER NOT NULL DEFAULT 0,
    status      TEXT    NOT NULL DEFAULT 'disconnected',
    created_at  TEXT    NOT NULL
);

CREATE TABLE IF NOT EXISTS goals (
    id              TEXT PRIMARY KEY,
    title           TEXT NOT NULL,
    description     TEXT,
    user_prompt     TEXT,
    status          TEXT,
    assigned_agents TEXT,
    final_insight   TEXT,
    confidence      REAL,
    created_at      TEXT,
    updated_at      TEXT
);

CREATE TABLE IF NOT EXISTS tasks (
    id          TEXT PRIMARY KEY,
    goal_id     TEXT,
    agent_name  TEXT,
    description TEXT,
    parameters  TEXT,
    status      TEXT,
    result      TEXT,
    created_at  TEXT
);
"""


_initialized = False

async def init_db() -> None:
    global _initialized
    _ensure_dir()
    async with aiosqlite.connect(str(DB_PATH)) as db:
        await db.executescript(_SCHEMA)
        
        # Simple migration for memory_nodes
        try:
            await db.execute("ALTER TABLE memory_nodes ADD COLUMN source TEXT NOT NULL DEFAULT ''")
        except Exception: pass
        try:
            await db.execute("ALTER TABLE memory_nodes ADD COLUMN confidence REAL NOT NULL DEFAULT 1.0")
        except Exception: pass
        
        # Migration for collaboration_signals
        try:
            await db.execute("ALTER TABLE collaboration_signals ADD COLUMN supporting_insights TEXT NOT NULL DEFAULT '[]'")
        except Exception: pass
        try:
            await db.execute("ALTER TABLE collaboration_signals ADD COLUMN confidence REAL")
        except Exception: pass
        try:
            await db.execute("ALTER TABLE collaboration_signals ADD COLUMN evidence TEXT")
        except Exception: pass
        try:
            await db.execute("ALTER TABLE collaboration_signals ADD COLUMN updated_at TEXT")
        except Exception: pass

        # Goals migration
        try: await db.execute("ALTER TABLE goals ADD COLUMN user_prompt TEXT")
        except Exception: pass
        try: await db.execute("ALTER TABLE goals ADD COLUMN assigned_agents TEXT")
        except Exception: pass
        try: await db.execute("ALTER TABLE goals ADD COLUMN final_insight TEXT")
        except Exception: pass
        try: await db.execute("ALTER TABLE goals ADD COLUMN confidence REAL")
        except Exception: pass
        try: await db.execute("ALTER TABLE goals ADD COLUMN updated_at TEXT")
        except Exception: pass
        
        await db.commit()
    _initialized = True


async def ensure_db_ready() -> None:
    """Ensure the database is initialized before any access."""
    if not _initialized:
        await init_db()


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _to_json(data: Any) -> str:
    return json.dumps(data)


async def _fetch_all(query: str, params: tuple = ()) -> list[dict[str, Any]]:
    await ensure_db_ready()
    async with aiosqlite.connect(str(DB_PATH)) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(query, params) as cursor:
            return [dict(row) for row in await cursor.fetchall()]


# ── Goals & Tasks ──────────────────────────────────────────

async def save_goal(id: str, title: str, description: str, user_prompt: str = "") -> None:
    await ensure_db_ready()
    async with aiosqlite.connect(str(DB_PATH)) as db:
        await db.execute(
            """INSERT INTO goals 
               (id, title, description, user_prompt, status, assigned_agents, confidence, created_at, updated_at) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (id, title, description, user_prompt, "pending", "[]", 0.0, _now(), _now())
        )
        await db.commit()

async def update_goal(
    id: str, 
    status: str = None, 
    assigned_agents: list[str] = None,
    final_insight: str = None,
    confidence: float = None
) -> None:
    await ensure_db_ready()
    updates = []
    params = []
    if status is not None:
        updates.append("status = ?")
        params.append(status)
    if assigned_agents is not None:
        updates.append("assigned_agents = ?")
        params.append(json.dumps(assigned_agents))
    if final_insight is not None:
        updates.append("final_insight = ?")
        params.append(final_insight)
    if confidence is not None:
        updates.append("confidence = ?")
        params.append(confidence)
    
    if not updates:
        return

    updates.append("updated_at = ?")
    params.append(_now())
    params.append(id)
    
    query = f"UPDATE goals SET {', '.join(updates)} WHERE id = ?"
    
    async with aiosqlite.connect(str(DB_PATH)) as db:
        await db.execute(query, tuple(params))
        await db.commit()

async def save_task(id: str, goal_id: str, agent_name: str, description: str, parameters: dict) -> None:
    await ensure_db_ready()
    async with aiosqlite.connect(str(DB_PATH)) as db:
        await db.execute(
            """INSERT INTO tasks 
               (id, goal_id, agent_name, description, parameters, status, created_at) 
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (id, goal_id, agent_name, description, json.dumps(parameters), "pending", _now())
        )
        await db.commit()

async def update_task(id: str, status: str, result: str = None) -> None:
    await ensure_db_ready()
    async with aiosqlite.connect(str(DB_PATH)) as db:
        await db.execute(
            "UPDATE tasks SET status = ?, result = ? WHERE id = ?",
            (status, result, id)
        )
        await db.commit()

async def get_all_goals() -> list[dict[str, Any]]:
    goals = await _fetch_all("SELECT * FROM goals ORDER BY created_at DESC")
    for goal in goals:
        try: goal['assigned_agents'] = json.loads(goal.get('assigned_agents', '[]'))
        except Exception: goal['assigned_agents'] = []
        
        goal['tasks'] = await _fetch_all("SELECT * FROM tasks WHERE goal_id = ?", (goal['id'],))
        for t in goal['tasks']:
            try: t['parameters'] = json.loads(t.get('parameters', '{}'))
            except Exception: t['parameters'] = {}
    return goals



# ── Agents ────────────────────────────────────────────────────

async def register_agent_db(
    name: str, description: str, personality: str,
    interval: int, tags: list[str],
) -> None:
    await ensure_db_ready()
    async with aiosqlite.connect(str(DB_PATH)) as db:
        await db.execute(
            """INSERT INTO agents (name, description, personality, interval, tags, status, registered_at)
               VALUES (?, ?, ?, ?, ?, 'running', ?)
               ON CONFLICT(name) DO UPDATE SET
                 description=excluded.description,
                 personality=excluded.personality,
                 interval=excluded.interval,
                 tags=excluded.tags,
                 status='running'""",
            (name, description, personality, interval, json.dumps(tags), _now()),
        )
        await db.commit()


async def update_agent_status(name: str, status: str) -> None:
    await ensure_db_ready()
    async with aiosqlite.connect(str(DB_PATH)) as db:
        await db.execute("UPDATE agents SET status = ? WHERE name = ?", (status, name))
        await db.commit()


async def delete_agent_db(name: str) -> None:
    await ensure_db_ready()
    async with aiosqlite.connect(str(DB_PATH)) as db:
        await db.execute("DELETE FROM agents WHERE name = ?", (name,))
        await db.commit()


async def get_registered_agents() -> list[dict[str, Any]]:
    return await _fetch_all("SELECT * FROM agents ORDER BY name")


# ── Agent Runs ────────────────────────────────────────────────

async def save_run_start(agent_name: str) -> int:
    await ensure_db_ready()
    async with aiosqlite.connect(str(DB_PATH)) as db:
        cursor = await db.execute(
            "INSERT INTO agent_runs (agent_name, started_at, status) VALUES (?, ?, ?)",
            (agent_name, _now(), "running"),
        )
        await db.commit()
        return cursor.lastrowid

async def save_run_end(run_id: int, status: str, result: str = "") -> None:
    await ensure_db_ready()
    async with aiosqlite.connect(str(DB_PATH)) as db:
        await db.execute(
            "UPDATE agent_runs SET finished_at = ?, status = ?, result = ? WHERE id = ?",
            (_now(), status, result, run_id),
        )
        await db.commit()

async def get_runs(limit: int = 50) -> list[dict[str, Any]]:
    return await _fetch_all("SELECT * FROM agent_runs ORDER BY id DESC LIMIT ?", (limit,))


# ── Insights ──────────────────────────────────────────────────

async def save_insight(agent_name: str, content: str, title: str = "") -> int:
    await ensure_db_ready()
    async with aiosqlite.connect(str(DB_PATH)) as db:
        cursor = await db.execute(
            "INSERT INTO insights (agent_name, title, content, created_at) VALUES (?, ?, ?, ?)",
            (agent_name, title, content, _now()),
        )
        await db.commit()
        return cursor.lastrowid

async def get_insights(limit: int = 50) -> list[dict[str, Any]]:
    return await _fetch_all("SELECT * FROM insights ORDER BY id DESC LIMIT ?", (limit,))


# ── Logs ──────────────────────────────────────────────────────

async def save_log(agent_name: str, message: str, level: str = "INFO") -> None:
    await ensure_db_ready()
    async with aiosqlite.connect(str(DB_PATH)) as db:
        await db.execute(
            "INSERT INTO logs (agent_name, level, message, created_at) VALUES (?, ?, ?, ?)",
            (agent_name, level, message, _now()),
        )
        await db.commit()

async def get_logs(limit: int = 100) -> list[dict[str, Any]]:
    return await _fetch_all("SELECT * FROM logs ORDER BY id DESC LIMIT ?", (limit,))


# ── World Events ──────────────────────────────────────────────

async def save_world_event(
    agent_name: str, topic: str, description: str,
    latitude: float, longitude: float, location: str = "",
) -> int:
    await ensure_db_ready()
    async with aiosqlite.connect(str(DB_PATH)) as db:
        cursor = await db.execute(
            """INSERT INTO world_events
               (agent_name, topic, description, latitude, longitude, location, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (agent_name, topic, description, latitude, longitude, location, _now()),
        )
        await db.commit()
        return cursor.lastrowid

async def get_world_events(limit: int = 100) -> list[dict[str, Any]]:
    return await _fetch_all("SELECT * FROM world_events ORDER BY id DESC LIMIT ?", (limit,))


# ── API Connections ───────────────────────────────────────────

async def save_connection(name: str, url: str, api_key: str, icon: str = "🔌") -> int:
    await ensure_db_ready()
    async with aiosqlite.connect(str(DB_PATH)) as db:
        cursor = await db.execute(
            """INSERT INTO api_connections (name, url, api_key, icon, status, created_at)
               VALUES (?, ?, ?, ?, 'disconnected', ?)
               ON CONFLICT(name) DO UPDATE SET url=excluded.url, api_key=excluded.api_key, icon=excluded.icon""",
            (name, url, api_key, icon, _now()),
        )
        await db.commit()
        return cursor.lastrowid

async def update_connection_status(name: str, status: str) -> None:
    await ensure_db_ready()
    async with aiosqlite.connect(str(DB_PATH)) as db:
        await db.execute("UPDATE api_connections SET status = ? WHERE name = ?", (status, name))
        await db.commit()

async def delete_connection(name: str) -> None:
    await ensure_db_ready()
    async with aiosqlite.connect(str(DB_PATH)) as db:
        await db.execute("DELETE FROM api_connections WHERE name = ?", (name,))
        await db.commit()

async def get_connections() -> list[dict[str, Any]]:
    return await _fetch_all("SELECT * FROM api_connections ORDER BY name")


# ── LLM Providers ────────────────────────────────────────────

async def save_provider(
    name: str, provider: str, model: str, api_key: str, url: str, is_default: bool,
) -> int:
    await ensure_db_ready()
    default_int = 1 if is_default else 0
    async with aiosqlite.connect(str(DB_PATH)) as db:
        if is_default:
            await db.execute("UPDATE llm_providers SET is_default = 0")
        cursor = await db.execute(
            """INSERT INTO llm_providers (name, provider, model, api_key, url, is_default, status, created_at)
               VALUES (?, ?, ?, ?, ?, ?, 'disconnected', ?)
               ON CONFLICT(name) DO UPDATE SET
                 provider=excluded.provider, model=excluded.model,
                 api_key=excluded.api_key, url=excluded.url,
                 is_default=excluded.is_default""",
            (name, provider, model, api_key, url, default_int, _now()),
        )
        await db.commit()
        return cursor.lastrowid

async def update_provider_status(name: str, status: str) -> None:
    await ensure_db_ready()
    async with aiosqlite.connect(str(DB_PATH)) as db:
        await db.execute("UPDATE llm_providers SET status = ? WHERE name = ?", (status, name))
        await db.commit()

async def delete_provider(name: str) -> None:
    await ensure_db_ready()
    async with aiosqlite.connect(str(DB_PATH)) as db:
        await db.execute("DELETE FROM llm_providers WHERE name = ?", (name,))
        await db.commit()

async def get_providers() -> list[dict[str, Any]]:
    return await _fetch_all("SELECT * FROM llm_providers ORDER BY name")
