"""
Unit tests for CIVION Memory Graph service.
"""

import pytest
from civion.services.memory_graph import (
    MemoryNode,
    store_insight,
    search_insights,
    link_related_insights,
    get_memory_graph,
)


@pytest.mark.asyncio
async def test_store_and_search_insight(test_db_path):
    """Test storing a MemoryNode and searching for it."""
    node = MemoryNode(
        agent_name="trend_agent",
        topic="AI Testing",
        content="Pytest is the best framework for Python testing.",
        tags=["testing", "python"],
    )
    node_id = await store_insight(node)
    assert node_id > 0
    assert node.id == node_id

    # Search by text
    results = await search_insights(query="Pytest", limit=5)
    assert len(results) > 0
    assert results[0]["topic"] == "AI Testing"

    # Search by agent name
    results = await search_insights(agent_name="trend_agent", limit=5)
    assert len(results) > 0

    # Search by tag
    results = await search_insights(tags=["testing"], limit=5)
    assert len(results) > 0


@pytest.mark.asyncio
async def test_link_related_insights(test_db_path):
    """Test auto-linking two nodes that share tags."""
    node1 = MemoryNode(
        agent_name="agent_a",
        topic="Topic A",
        content="Content A",
        tags=["ai", "testing"],
    )
    node2 = MemoryNode(
        agent_name="agent_b",
        topic="Topic B",
        content="Content B",
        tags=["ai", "ml"],
    )
    id1 = await store_insight(node1)
    id2 = await store_insight(node2)

    links_created = await link_related_insights(id2)
    assert links_created == 1  # node2 shares "ai" tag with node1


@pytest.mark.asyncio
async def test_get_memory_graph(test_db_path):
    """Test retrieving the full memory graph for dashboard."""
    node = MemoryNode(
        agent_name="agent_c",
        topic="Graph Test",
        content="Visualise this",
        tags=["graph"],
    )
    await store_insight(node)

    graph = await get_memory_graph(limit=10)
    assert "nodes" in graph
    assert "links" in graph
    assert len(graph["nodes"]) > 0
