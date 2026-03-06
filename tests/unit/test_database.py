"""
Unit tests for CIVION Database operations.
"""

import pytest
import civion.storage.database as db

@pytest.mark.asyncio
async def test_database_init(test_db_path):
    """Test database tables are initialized successfully."""
    # Since test_db_path calls db.init_db(), we just verify tables exist
    tables = await db._fetch_all("SELECT name FROM sqlite_master WHERE type='table'")
    table_names = [t["name"] for t in tables]
    
    expected_tables = [
        "agents", "agent_runs", "insights", "logs", 
        "memory_nodes", "memory_links", "collaboration_signals",
        "world_events", "api_connections", "llm_providers"
    ]
    
    for expected in expected_tables:
        assert expected in table_names

@pytest.mark.asyncio
async def test_database_agent_crud(test_db_path):
    """Test Create, Read, Update, Delete for agents table."""
    # Create
    await db.register_agent_db("test_db_agent", "Test desc", "Watcher", 3600, ["t1"])
    agents = await db.get_registered_agents()
    assert len(agents) == 1
    assert agents[0]["name"] == "test_db_agent"
    assert agents[0]["status"] == "running"
    
    # Update Status
    await db.update_agent_status("test_db_agent", "stopped")
    agents = await db.get_registered_agents()
    assert agents[0]["status"] == "stopped"
    
    # Delete
    await db.delete_agent_db("test_db_agent")
    agents = await db.get_registered_agents()
    assert len(agents) == 0

@pytest.mark.asyncio
async def test_database_log_crud(test_db_path):
    """Test writing and reading logs."""
    await db.save_log("system", "Test log message", "INFO")
    logs = await db.get_logs()
    
    assert len(logs) == 1
    assert logs[0]["message"] == "Test log message"
    assert logs[0]["level"] == "INFO"

@pytest.mark.asyncio
async def test_database_insight_crud(test_db_path):
    """Test saving and getting insights."""
    await db.save_insight("trend_agent", "We found AI", "AI Is Here")
    insights = await db.get_insights()
    
    assert len(insights) == 1
    assert insights[0]["title"] == "AI Is Here"
    assert insights[0]["content"] == "We found AI"
    assert insights[0]["agent_name"] == "trend_agent"
