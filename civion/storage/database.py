"""
CIVION Database
Async SQLite database with aiosqlite.
"""
from __future__ import annotations
import aiosqlite
from pathlib import Path
from typing import Any, Dict, List, Optional
from civion.core.config import settings
from civion.core.logger import get_logger

log = get_logger("database")

DB_PATH = settings.data_dir / "civion.db"


class Database:
    """Async SQLite database wrapper."""

    def __init__(self):
        self._db: Optional[aiosqlite.Connection] = None

    async def connect(self):
        """Initialize database connection and create tables."""
        self._db = await aiosqlite.connect(str(DB_PATH))
        self._db.row_factory = aiosqlite.Row
        await self._create_tables()
        log.info(f"Database connected: {DB_PATH}")

    async def close(self):
        """Close database connection."""
        if self._db:
            await self._db.close()
            log.info("Database connection closed")

    async def _create_tables(self):
        """Create all tables if they don't exist."""
        await self._db.executescript("""
            CREATE TABLE IF NOT EXISTS goals (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                description TEXT,
                state TEXT DEFAULT 'created',
                priority INTEGER DEFAULT 5,
                tasks_json TEXT DEFAULT '[]',
                progress REAL DEFAULT 0.0,
                created_at TEXT,
                updated_at TEXT
            );

            CREATE TABLE IF NOT EXISTS insights (
                id TEXT PRIMARY KEY,
                title TEXT,
                content TEXT,
                source TEXT,
                agent_name TEXT,
                confidence REAL DEFAULT 0.5,
                tags_json TEXT DEFAULT '[]',
                created_at TEXT
            );

            CREATE TABLE IF NOT EXISTS signals (
                id TEXT PRIMARY KEY,
                title TEXT,
                description TEXT,
                source TEXT,
                signal_type TEXT,
                strength REAL DEFAULT 0.5,
                metadata_json TEXT DEFAULT '{}',
                detected_at TEXT
            );

            CREATE TABLE IF NOT EXISTS predictions (
                id TEXT PRIMARY KEY,
                title TEXT,
                description TEXT,
                confidence REAL,
                timeframe TEXT,
                state TEXT DEFAULT 'pending',
                source_signals_json TEXT DEFAULT '[]',
                created_at TEXT,
                verified_at TEXT
            );

            CREATE TABLE IF NOT EXISTS personas (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                system_prompt TEXT,
                reasoning_style TEXT,
                user_id TEXT,
                is_shared INTEGER DEFAULT 0,
                created_at TEXT
            );

            CREATE TABLE IF NOT EXISTS reasoning_loops (
                id TEXT PRIMARY KEY,
                topic TEXT,
                hypothesis TEXT,
                arguments_json TEXT DEFAULT '[]',
                consensus TEXT,
                final_confidence REAL,
                state TEXT DEFAULT 'gathering',
                created_at TEXT
            );

            CREATE TABLE IF NOT EXISTS events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                type TEXT,
                source TEXT,
                data_json TEXT,
                timestamp TEXT
            );

            CREATE TABLE IF NOT EXISTS agent_runs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                agent_name TEXT,
                status TEXT,
                insights_found INTEGER DEFAULT 0,
                signals_found INTEGER DEFAULT 0,
                duration_seconds REAL,
                error TEXT,
                started_at TEXT,
                finished_at TEXT
            );
        """)
        await self._db.commit()

    # ── Generic CRUD ─────────────────────────────────
    async def insert(self, table: str, data: Dict[str, Any]) -> str:
        """Insert a row into a table."""
        cols = ", ".join(data.keys())
        placeholders = ", ".join(["?"] * len(data))
        await self._db.execute(
            f"INSERT OR REPLACE INTO {table} ({cols}) VALUES ({placeholders})",
            list(data.values()),
        )
        await self._db.commit()
        return data.get("id", "")

    async def get(self, table: str, row_id: str) -> Optional[Dict]:
        """Get a single row by ID."""
        cursor = await self._db.execute(
            f"SELECT * FROM {table} WHERE id = ?", (row_id,)
        )
        row = await cursor.fetchone()
        return dict(row) if row else None

    async def list_all(
        self, table: str, limit: int = 50, order_by: str = "created_at DESC"
    ) -> List[Dict]:
        """List rows from a table."""
        cursor = await self._db.execute(
            f"SELECT * FROM {table} ORDER BY {order_by} LIMIT ?", (limit,)
        )
        return [dict(row) for row in await cursor.fetchall()]

    async def delete(self, table: str, row_id: str) -> bool:
        """Delete a row by ID."""
        cursor = await self._db.execute(
            f"DELETE FROM {table} WHERE id = ?", (row_id,)
        )
        await self._db.commit()
        return cursor.rowcount > 0

    async def count(self, table: str) -> int:
        """Count rows in a table."""
        cursor = await self._db.execute(f"SELECT COUNT(*) FROM {table}")
        row = await cursor.fetchone()
        return row[0] if row else 0

    async def query(self, sql: str, params: tuple = ()) -> List[Dict]:
        """Execute raw SQL query."""
        cursor = await self._db.execute(sql, params)
        return [dict(row) for row in await cursor.fetchall()]


# Singleton
database = Database()
