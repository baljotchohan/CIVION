import pytest
import asyncio
from typing import Dict
from unittest.mock import patch, AsyncMock
from civion.engine.signal_engine import SignalEngine

@pytest.fixture
def signal_engine():
    return SignalEngine()

@pytest.mark.asyncio
async def test_engine_init(signal_engine):
    assert len(signal_engine.signals) == 0

@pytest.mark.asyncio
async def test_process_valid_signal(signal_engine):
    data = {"title": "Test sig", "description": "desc", "tags": ["test"]}
    sig = await signal_engine.process_signal("github", data, 0.9)
    assert sig["source"] == "github"
    assert sig["confidence"] == 0.9
    assert sig["title"] == "Test sig"
    assert len(signal_engine.signals) == 1

@pytest.mark.asyncio
async def test_process_signal_generates_id(signal_engine):
    data = {"title": "Test"}
    sig = await signal_engine.process_signal("github", data, 0.5)
    assert sig["id"].startswith("sig_")
    
@pytest.mark.asyncio
async def test_process_signal_defaults(signal_engine):
    data = {}
    sig = await signal_engine.process_signal("source1", data, 0.5)
    assert sig["title"] == "Event from source1"
    assert sig["signal_type"] == "generic"
    assert len(sig["tags"]) == 0

@pytest.mark.asyncio
async def test_get_recent_signals_empty(signal_engine):
    sigs = await signal_engine.get_recent_signals(10)
    assert len(sigs) == 0

@pytest.mark.asyncio
async def test_get_recent_signals_count(signal_engine):
    for i in range(5):
        await signal_engine.process_signal("src", {"title": f"T{i}"}, 0.5)
    sigs = await signal_engine.get_recent_signals(3)
    assert len(sigs) == 3

@pytest.mark.asyncio
async def test_get_recent_signals_ordering(signal_engine):
    await signal_engine.process_signal("src", {"title": "First"}, 0.1)
    await asyncio.sleep(0.01)
    await signal_engine.process_signal("src", {"title": "Second"}, 0.2)
    sigs = await signal_engine.get_recent_signals(10)
    assert sigs[0]["title"] == "Second"  # reverse chron
    assert sigs[1]["title"] == "First"

@pytest.mark.asyncio
async def test_process_signal_broadcasts(signal_engine):
    with patch("civion.engine.signal_engine.manager.broadcast", new_callable=AsyncMock) as mock_broadcast:
        data = {"title": "T"}
        sig = await signal_engine.process_signal("github", data, 0.9)
        mock_broadcast.assert_called_once_with("signal_detected", sig)

@pytest.mark.asyncio
async def test_signal_storage_limit(signal_engine):
    # Could test pruning if implemented, for now just ensure addition works
    for _ in range(100):
        await signal_engine.process_signal("src", {}, 0.5)
    assert len(signal_engine.signals) == 100

@pytest.mark.asyncio
async def test_signal_evidence_mapping(signal_engine):
    data = {"evidence": ["link1", "link2"]}
    sig = await signal_engine.process_signal("src", data, 0.5)
    assert sig["evidence"] == ["link1", "link2"]

@pytest.mark.asyncio
async def test_signal_url_mapping(signal_engine):
    data = {"url": "http://test.com"}
    sig = await signal_engine.process_signal("src", data, 0.5)
    assert sig["url"] == "http://test.com"

@pytest.mark.asyncio
async def test_signal_strength_mapping(signal_engine):
    data = {"strength": 0.99}
    sig = await signal_engine.process_signal("src", data, 0.5)
    assert sig["strength"] == 0.99

@pytest.mark.asyncio
async def test_signal_strength_fallback(signal_engine):
    data = {}
    sig = await signal_engine.process_signal("src", data, 0.5)
    assert sig["strength"] == 0.5

@pytest.mark.asyncio
async def test_massive_concurrency(signal_engine):
    tasks = [signal_engine.process_signal("src", {}, 0.5) for _ in range(500)]
    await asyncio.gather(*tasks)
    assert len(signal_engine.signals) == 500
