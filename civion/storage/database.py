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
"""


async def init_db() -> None:
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
        
        await db.commit()


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


async def _fetch_all(query: str, params: tuple = ()) -> list[dict[str, Any]]:
    async with aiosqlite.connect(str(DB_PATH)) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(query, params) as cursor:
            return [dict(row) for row in await cursor.fetchall()]


# ── Agents ────────────────────────────────────────────────────

async def register_agent_db(
    name: str, description: str, personality: str,
    interval: int, tags: list[str],
) -> None:
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
    async with aiosqlite.connect(str(DB_PATH)) as db:
        await db.execute("UPDATE agents SET status = ? WHERE name = ?", (status, name))
        await db.commit()


async def delete_agent_db(name: str) -> None:
    async with aiosqlite.connect(str(DB_PATH)) as db:
        await db.execute("DELETE FROM agents WHERE name = ?", (name,))
        await db.commit()


async def get_registered_agents() -> list[dict[str, Any]]:
    return await _fetch_all("SELECT * FROM agents ORDER BY name")


# ── Agent Runs ────────────────────────────────────────────────

async def save_run_start(agent_name: str) -> int:
    async with aiosqlite.connect(str(DB_PATH)) as db:
        cursor = await db.execute(
            "INSERT INTO agent_runs (agent_name, started_at, status) VALUES (?, ?, ?)",
            (agent_name, _now(), "running"),
        )
        await db.commit()
        return cursor.lastrowid

async def save_run_end(run_id: int, status: str, result: str = "") -> None:
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
    async with aiosqlite.connect(str(DB_PATH)) as db:
        await db.execute("UPDATE api_connections SET status = ? WHERE name = ?", (status, name))
        await db.commit()

async def delete_connection(name: str) -> None:
    async with aiosqlite.connect(str(DB_PATH)) as db:
        await db.execute("DELETE FROM api_connections WHERE name = ?", (name,))
        await db.commit()

async def get_connections() -> list[dict[str, Any]]:
    return await _fetch_all("SELECT * FROM api_connections ORDER BY name")


# ── LLM Providers ────────────────────────────────────────────

async def save_provider(
    name: str, provider: str, model: str, api_key: str, url: str, is_default: bool,
) -> int:
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
    async with aiosqlite.connect(str(DB_PATH)) as db:
        await db.execute("UPDATE llm_providers SET status = ? WHERE name = ?", (status, name))
        await db.commit()

async def delete_provider(name: str) -> None:
    async with aiosqlite.connect(str(DB_PATH)) as db:
        await db.execute("DELETE FROM llm_providers WHERE name = ?", (name,))
        await db.commit()

async def get_providers() -> list[dict[str, Any]]:
    return await _fetch_all("SELECT * FROM llm_providers ORDER BY name")
