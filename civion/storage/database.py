"""
CIVION — SQLite Storage Layer
Async helpers for agent runs, insights, logs, memory graph,
collaboration signals, world events, and agent registration.

All tables are created idempotently via ``init_db()``.
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import aiosqlite

from civion.config.settings import settings

# ── Database path ─────────────────────────────────────────────

DB_PATH = Path(settings.database.path)


def _ensure_dir() -> None:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)


# ── Schema ────────────────────────────────────────────────────

_SCHEMA = """
-- Registered agents (persistent registry)
CREATE TABLE IF NOT EXISTS agents (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL UNIQUE,
    description TEXT    NOT NULL DEFAULT '',
    personality TEXT    NOT NULL DEFAULT 'Explorer',
    interval    INTEGER NOT NULL DEFAULT 3600,
    tags        TEXT    NOT NULL DEFAULT '[]',
    registered_at TEXT  NOT NULL
);

-- Execution history
CREATE TABLE IF NOT EXISTS agent_runs (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    agent_name  TEXT    NOT NULL,
    started_at  TEXT    NOT NULL,
    finished_at TEXT,
    status      TEXT    NOT NULL DEFAULT 'running',
    result      TEXT
);

-- Processed insights
CREATE TABLE IF NOT EXISTS insights (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    agent_name  TEXT    NOT NULL,
    title       TEXT    NOT NULL DEFAULT '',
    content     TEXT    NOT NULL,
    created_at  TEXT    NOT NULL
);

-- Structured logs
CREATE TABLE IF NOT EXISTS logs (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    agent_name  TEXT    NOT NULL,
    level       TEXT    NOT NULL DEFAULT 'INFO',
    message     TEXT    NOT NULL,
    created_at  TEXT    NOT NULL
);

-- Memory graph nodes
CREATE TABLE IF NOT EXISTS memory_nodes (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    agent_name  TEXT    NOT NULL,
    topic       TEXT    NOT NULL DEFAULT '',
    content     TEXT    NOT NULL,
    tags        TEXT    NOT NULL DEFAULT '[]',
    created_at  TEXT    NOT NULL
);

-- Memory graph edges
CREATE TABLE IF NOT EXISTS memory_links (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    source_id   INTEGER NOT NULL,
    target_id   INTEGER NOT NULL,
    relation    TEXT    NOT NULL DEFAULT 'related',
    FOREIGN KEY (source_id) REFERENCES memory_nodes(id),
    FOREIGN KEY (target_id) REFERENCES memory_nodes(id)
);

-- Collaboration signals
CREATE TABLE IF NOT EXISTS collaboration_signals (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    title           TEXT    NOT NULL,
    description     TEXT    NOT NULL DEFAULT '',
    confidence      REAL    NOT NULL DEFAULT 0.5,
    agents_involved TEXT    NOT NULL DEFAULT '[]',
    created_at      TEXT    NOT NULL
);

-- World map events
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
"""


# ── Initialisation ────────────────────────────────────────────

async def init_db() -> None:
    """Create all tables (idempotent)."""
    _ensure_dir()
    async with aiosqlite.connect(str(DB_PATH)) as db:
        await db.executescript(_SCHEMA)
        await db.commit()


# ── Helpers ───────────────────────────────────────────────────

def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


async def _fetch_all(query: str, params: tuple = ()) -> list[dict[str, Any]]:
    async with aiosqlite.connect(str(DB_PATH)) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(query, params) as cursor:
            return [dict(row) for row in await cursor.fetchall()]


# ── Agents Registry ──────────────────────────────────────────

async def register_agent_db(
    name: str, description: str, personality: str,
    interval: int, tags: list[str],
) -> None:
    """Upsert an agent into the persistent registry."""
    async with aiosqlite.connect(str(DB_PATH)) as db:
        await db.execute(
            """INSERT INTO agents (name, description, personality, interval, tags, registered_at)
               VALUES (?, ?, ?, ?, ?, ?)
               ON CONFLICT(name) DO UPDATE SET
                 description=excluded.description,
                 personality=excluded.personality,
                 interval=excluded.interval,
                 tags=excluded.tags""",
            (name, description, personality, interval, json.dumps(tags), _now()),
        )
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
        return cursor.lastrowid  # type: ignore[return-value]


async def save_run_end(run_id: int, status: str, result: str = "") -> None:
    async with aiosqlite.connect(str(DB_PATH)) as db:
        await db.execute(
            "UPDATE agent_runs SET finished_at = ?, status = ?, result = ? WHERE id = ?",
            (_now(), status, result, run_id),
        )
        await db.commit()


async def get_runs(limit: int = 50) -> list[dict[str, Any]]:
    return await _fetch_all(
        "SELECT * FROM agent_runs ORDER BY id DESC LIMIT ?", (limit,)
    )


# ── Insights ──────────────────────────────────────────────────

async def save_insight(agent_name: str, content: str, title: str = "") -> int:
    async with aiosqlite.connect(str(DB_PATH)) as db:
        cursor = await db.execute(
            "INSERT INTO insights (agent_name, title, content, created_at) VALUES (?, ?, ?, ?)",
            (agent_name, title, content, _now()),
        )
        await db.commit()
        return cursor.lastrowid  # type: ignore[return-value]


async def get_insights(limit: int = 50) -> list[dict[str, Any]]:
    return await _fetch_all(
        "SELECT * FROM insights ORDER BY id DESC LIMIT ?", (limit,)
    )


# ── Logs ──────────────────────────────────────────────────────

async def save_log(agent_name: str, message: str, level: str = "INFO") -> None:
    async with aiosqlite.connect(str(DB_PATH)) as db:
        await db.execute(
            "INSERT INTO logs (agent_name, level, message, created_at) VALUES (?, ?, ?, ?)",
            (agent_name, level, message, _now()),
        )
        await db.commit()


async def get_logs(limit: int = 100) -> list[dict[str, Any]]:
    return await _fetch_all(
        "SELECT * FROM logs ORDER BY id DESC LIMIT ?", (limit,)
    )


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
        return cursor.lastrowid  # type: ignore[return-value]


async def get_world_events(limit: int = 100) -> list[dict[str, Any]]:
    return await _fetch_all(
        "SELECT * FROM world_events ORDER BY id DESC LIMIT ?", (limit,)
    )
