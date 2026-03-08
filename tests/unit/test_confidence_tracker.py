import pytest
import asyncio
from unittest.mock import patch, AsyncMock
from civion.engine.confidence_tracker import ConfidenceTracker
from civion.models.confidence import ConfidenceUpdate, CascadeEvent

@pytest.fixture
def tracker():
    return ConfidenceTracker()

@pytest.mark.asyncio
async def test_init_confidence_creates_record(tracker):
    """Test initializing confidence for a new insight."""
    with patch("civion.engine.event_stream.event_stream.emit", new_callable=AsyncMock) as mock_pub:
        update = await tracker.init_confidence("insight_1", "agent_alpha", 0.7)
        assert update.insight_id == "insight_1"
        assert update.confidence == 0.7
        assert len(update.cascade_events) == 1
        assert update.cascade_events[0].agent == "agent_alpha"
        assert tracker._confidence_records["insight_1"] == update
        assert mock_pub.called

@pytest.mark.asyncio
async def test_add_verification_updates_confidence(tracker):
    """Test adding verification updates score and appends event."""
    await tracker.init_confidence("insight_1", "agent_alpha", 0.5)
    with patch("civion.engine.event_stream.event_stream.emit", new_callable=AsyncMock) as mock_pub:
        update = await tracker.add_verification("insight_1", "agent_beta", 0.9)
        assert update.confidence == 0.9
        assert len(update.cascade_events) == 2
        assert update.cascade_events[1].agent == "agent_beta"
        assert update.cascade_events[1].confidence == 0.9
        assert mock_pub.called

@pytest.mark.asyncio
async def test_add_verification_missing_id(tracker):
    """Test adding verification for non-existent ID returns None."""
    result = await tracker.add_verification("missing", "agent", 0.8)
    assert result is None

@pytest.mark.asyncio
async def test_broadcast_payload_structure(tracker):
    """Test the structure of the broadcasted event."""
    with patch("civion.engine.event_stream.event_stream.emit", new_callable=AsyncMock) as mock_pub:
        await tracker.init_confidence("i1", "a1", 0.6)
        args, kwargs = mock_pub.call_args
        assert args[0] == "confidence_update"
        data = args[1]
        assert data["insight_id"] == "i1"
        assert data["agent"] == "a1"
        assert data["confidence"] == 0.6
        assert "timestamp" in data

@pytest.mark.asyncio
async def test_consecutive_verifications(tracker):
    """Test multiple verifications in sequence."""
    await tracker.init_confidence("i1", "a1", 0.1)
    await tracker.add_verification("i1", "a2", 0.3)
    await tracker.add_verification("i1", "a3", 0.6)
    update = await tracker.add_verification("i1", "a4", 0.9)
    assert len(update.cascade_events) == 4
    assert update.confidence == 0.9

@pytest.mark.asyncio
async def test_isolation_between_insights(tracker):
    """Test that different insight IDs are isolated."""
    await tracker.init_confidence("i1", "a1", 0.5)
    await tracker.init_confidence("i2", "a2", 0.8)
    assert tracker._confidence_records["i1"].confidence == 0.5
    assert tracker._confidence_records["i2"].confidence == 0.8

@pytest.mark.asyncio
async def test_re_init_overwrites(tracker):
    """Test that re-initializing an ID overwrites the old record."""
    await tracker.init_confidence("i1", "a1", 0.5)
    await tracker.init_confidence("i1", "a2", 0.9)
    assert tracker._confidence_records["i1"].confidence == 0.9
    assert len(tracker._confidence_records["i1"].cascade_events) == 1

@pytest.mark.asyncio
async def test_cascade_event_integrity(tracker):
    """Test CascadeEvent storage in the record."""
    await tracker.init_confidence("i1", "a1", 0.2)
    record = tracker._confidence_records["i1"]
    event = record.cascade_events[0]
    assert isinstance(event, CascadeEvent)
    assert event.agent == "a1"
    assert event.confidence == 0.2

@pytest.mark.asyncio
async def test_confidence_update_type(tracker):
    """Test ConfidenceUpdate return type."""
    update = await tracker.init_confidence("i", "a", 0.5)
    assert isinstance(update, ConfidenceUpdate)

@pytest.mark.asyncio
async def test_broadcast_called_on_every_update(tracker):
    """Test broadcast is called for both init and verify."""
    with patch("civion.engine.event_stream.event_stream.emit", new_callable=AsyncMock) as mock_pub:
        await tracker.init_confidence("i1", "a1", 0.5)
        await tracker.add_verification("i1", "a2", 0.6)
        assert mock_pub.call_count == 2
