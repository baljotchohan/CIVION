"""
CIVION — Agent Memory Graph
A shared knowledge system where agents store insights as nodes,
link related insights, and query previous knowledge.

The memory graph is backed by SQLite (same DB as the rest of CIVION)
and exposes three core operations:

    store_insight()          — persist an insight node
    search_insights()        — full-text / tag search
    link_related_insights()  — auto-link nodes by shared tags
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from typing import Any

import aiosqlite

from civion.storage.database import DB_PATH


# ── Data Structures ───────────────────────────────────────────

class MemoryNode:
    """A single insight stored in the knowledge graph."""

    __slots__ = ("id", "timestamp", "agent_name", "topic", "content", "tags")

    def __init__(
        self,
        agent_name: str,
        topic: str,
        content: str,
        tags: list[str] | None = None,
        *,
        id: int | None = None,
        timestamp: str | None = None,
    ) -> None:
        self.id = id
        self.timestamp = timestamp or datetime.now(timezone.utc).isoformat()
        self.agent_name = agent_name
        self.topic = topic
        self.content = content
        self.tags = tags or []

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "timestamp": self.timestamp,
            "agent_name": self.agent_name,
            "topic": self.topic,
            "content": self.content,
            "tags": self.tags,
        }


# ── Store ─────────────────────────────────────────────────────

async def store_insight(node: MemoryNode) -> int:
    """Persist a MemoryNode and return its row id."""
    async with aiosqlite.connect(str(DB_PATH)) as db:
        cursor = await db.execute(
            """INSERT INTO memory_nodes
               (agent_name, topic, content, tags, created_at)
               VALUES (?, ?, ?, ?, ?)""",
            (
                node.agent_name,
                node.topic,
                node.content,
                json.dumps(node.tags),
                node.timestamp,
            ),
        )
        await db.commit()
        node.id = cursor.lastrowid
        return cursor.lastrowid  # type: ignore[return-value]


# ── Search ────────────────────────────────────────────────────

async def search_insights(
    query: str = "",
    agent_name: str = "",
    tags: list[str] | None = None,
    limit: int = 20,
) -> list[dict[str, Any]]:
    """
    Search the memory graph.

    Supports:
      - free-text search on topic + content
      - filter by agent_name
      - filter by tags (any match)
    """
    conditions: list[str] = []
    params: list[Any] = []

    if query:
        conditions.append("(topic LIKE ? OR content LIKE ?)")
        params += [f"%{query}%", f"%{query}%"]

    if agent_name:
        conditions.append("agent_name = ?")
        params.append(agent_name)

    if tags:
        # Match any tag
        tag_clauses = " OR ".join(["tags LIKE ?"] * len(tags))
        conditions.append(f"({tag_clauses})")
        params += [f'%"{t}"%' for t in tags]

    where = " AND ".join(conditions) if conditions else "1=1"
    sql = f"SELECT * FROM memory_nodes WHERE {where} ORDER BY id DESC LIMIT ?"
    params.append(limit)

    async with aiosqlite.connect(str(DB_PATH)) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(sql, tuple(params)) as cursor:
            rows = await cursor.fetchall()
            results = []
            for row in rows:
                d = dict(row)
                try:
                    d["tags"] = json.loads(d.get("tags", "[]"))
                except Exception:
                    d["tags"] = []
                results.append(d)
            return results


# ── Link Related Insights ─────────────────────────────────────

async def link_related_insights(node_id: int) -> int:
    """
    Auto-link a newly stored insight to existing insights
    that share at least one tag.  Returns the number of links created.
    """
    async with aiosqlite.connect(str(DB_PATH)) as db:
        db.row_factory = aiosqlite.Row

        # Get the new node's tags
        async with db.execute(
            "SELECT tags FROM memory_nodes WHERE id = ?", (node_id,)
        ) as cur:
            row = await cur.fetchone()
            if not row:
                return 0
            try:
                node_tags: list[str] = json.loads(row["tags"])
            except Exception:
                return 0

        if not node_tags:
            return 0

        # Find other nodes sharing any tag
        tag_clauses = " OR ".join(["tags LIKE ?"] * len(node_tags))
        sql = f"""
            SELECT id FROM memory_nodes
            WHERE id != ? AND ({tag_clauses})
        """
        params: list[Any] = [node_id] + [f'%"{t}"%' for t in node_tags]

        async with db.execute(sql, tuple(params)) as cur:
            related_rows = await cur.fetchall()

        count = 0
        for r in related_rows:
            other_id = r["id"]
            # Avoid duplicates
            async with db.execute(
                """SELECT 1 FROM memory_links
                   WHERE (source_id = ? AND target_id = ?)
                      OR (source_id = ? AND target_id = ?)""",
                (node_id, other_id, other_id, node_id),
            ) as dup_cur:
                if await dup_cur.fetchone():
                    continue

            await db.execute(
                "INSERT INTO memory_links (source_id, target_id, relation) VALUES (?, ?, ?)",
                (node_id, other_id, "shared_tags"),
            )
            count += 1

        await db.commit()
        return count


# ── Retrieve Full Graph (for dashboard) ───────────────────────

async def get_memory_graph(limit: int = 50) -> dict[str, Any]:
    """Return nodes and links for the knowledge graph visualisation."""
    nodes = await search_insights(limit=limit)

    async with aiosqlite.connect(str(DB_PATH)) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(
            "SELECT * FROM memory_links ORDER BY id DESC LIMIT ?", (limit * 3,)
        ) as cur:
            link_rows = await cur.fetchall()
            links = [dict(r) for r in link_rows]

    return {"nodes": nodes, "links": links}
