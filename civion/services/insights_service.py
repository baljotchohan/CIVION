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
    source: str = "",
    confidence: float = 1.0,
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
            source=source,
            confidence=confidence,
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


async def get_agent_metrics(agent_name: str) -> dict | None:
    """
    Calculate performance metrics for a specific agent.
    
    Args:
        agent_name: Name of the agent
    
    Returns:
        Dictionary with performance metrics or None if agent not found
    """
    from civion.storage.database import get_runs
    from datetime import datetime
    
    try:
        runs = await get_runs()
        agent_runs = [
            r for r in runs 
            if r.get('agent_name') == agent_name
        ]
        
        if not agent_runs:
            return {
                'agent_name': agent_name,
                'total_runs': 0,
                'successful_runs': 0,
                'failed_runs': 0,
                'success_rate': 0.0,
                'last_run': None,
                'first_run': None,
                'total_executions': 0
            }
        
        # Calculate metrics
        successful = len([
            r for r in agent_runs 
            if r.get('status') == 'success'
        ])
        failed = len([
            r for r in agent_runs 
            if r.get('status') == 'failed'
        ])
        
        success_rate = (successful / len(agent_runs) * 100) if agent_runs else 0
        
        return {
            'agent_name': agent_name,
            'total_runs': len(agent_runs),
            'successful_runs': successful,
            'failed_runs': failed,
            'success_rate': round(success_rate, 2),
            'last_run': agent_runs[0].get('end_time') if agent_runs else None,
            'first_run': agent_runs[-1].get('start_time') if agent_runs else None,
            'total_executions': len(agent_runs)
        }
        
    except Exception as e:
        logger.error(f"Failed to get metrics for {agent_name}: {e}")
        return None
