"""
Unit tests for CIVION EventEngine.
"""

import asyncio
import pytest
from civion.engine.event_engine import EventEngine, AgentEvent

@pytest.mark.asyncio
async def test_event_engine_emit_and_fetch(test_db_path):
    """Test emitting an event and retrieving it from DB."""
    engine = EventEngine()
    
    event = AgentEvent(
        agent_name="tester",
        topic="Test Event",
        description="Just testing the pipeline",
        latitude=40.0,
        longitude=-74.0,
        location="NY"
    )
    
    event_id = await engine.emit(event)
    assert event_id > 0
    
    # Retrieve recent events
    recent = await engine.get_recent(limit=10)
    assert len(recent) > 0
    
    # Verify properties
    saved = recent[0]
    assert saved["agent_name"] == "tester"
    assert saved["topic"] == "Test Event"
    assert saved["location"] == "NY"
