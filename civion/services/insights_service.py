"""
CIVION — Insights Service
Centralises insight storage and retrieval.
Coordinates between the SQLite database and the memory graph
so every insight is stored in both systems.
"""

from __future__ import annotations

import logging
from typing import Any

from civion.storage.database import save_insight, get_insights

logger = logging.getLogger("civion.insights")


async def store_insight(
    agent_name: str,
    title: str,
    content: str,
    tags: list[str] | None = None,
) -> int:
    """
    Store an insight and mirror it to the memory graph.
    Returns the insight row id.
    """
    # 1. Store in main insights table
    insight_id = await save_insight(agent_name, content, title)
    logger.info("Insight #%d stored: %s", insight_id, title)

    # 2. Mirror to memory graph
    try:
        from civion.services.memory_graph import (
            MemoryNode, store_insight as mg_store, link_related_insights,
        )
        node = MemoryNode(
            agent_name=agent_name,
            topic=title,
            content=content[:2000],
            tags=tags or [],
        )
        node_id = await mg_store(node)
        await link_related_insights(node_id)
        logger.debug("Memory graph node #%d created for insight #%d", node_id, insight_id)
    except Exception as exc:
        logger.warning("Memory graph storage failed: %s", exc)

    return insight_id


async def get_recent_insights(limit: int = 50) -> list[dict[str, Any]]:
    """Retrieve the latest insights."""
    return await get_insights(limit)
