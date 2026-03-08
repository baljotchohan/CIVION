import pytest
from datetime import datetime, timezone
from civion.engine.signal_engine import SignalEngine
from civion.models.signal import Signal

@pytest.fixture
def engine():
    return SignalEngine()

def test_initialization(engine):
    assert len(engine.signals) == 0
    assert len(engine.subscribers) == 0

@pytest.mark.asyncio
async def test_process_signal_valid(engine):
    sig = Signal(source="github", title="Test", confidence=0.8, strength=0.7, signal_type="code", timestamp=datetime.now(timezone.utc).isoformat())
    await engine.process_signal(sig)
    assert len(engine.signals) == 1
    assert engine.signals[0].id == sig.id

@pytest.mark.asyncio
async def test_process_signal_empty(engine):
    with pytest.raises(ValueError):
        await engine.process_signal(Signal(source="", title="", confidence=0, strength=0, signal_type="", timestamp=""))

@pytest.mark.asyncio
async def test_subscribe(engine):
    cb = lambda x: x
    engine.subscribe(cb)
    assert len(engine.subscribers) == 1
    assert engine.subscribers[0] == cb

@pytest.mark.asyncio
async def test_unsubscribe(engine):
    cb = lambda x: x
    engine.subscribe(cb)
    engine.unsubscribe(cb)
    assert len(engine.subscribers) == 0

@pytest.mark.asyncio
async def test_get_recent_signals(engine):
    for i in range(15):
        await engine.process_signal(Signal(source=f"src{i}", title=f"T{i}", confidence=0.8, strength=0.7, signal_type="code", timestamp=datetime.now(timezone.utc).isoformat()))
    recent = engine.get_recent_signals(10)
    assert len(recent) == 10
    assert recent[0].title == "T14" # most recent

@pytest.mark.asyncio
async def test_filter_signals_by_source(engine):
    await engine.process_signal(Signal(source="github", title="T1", confidence=0.8, strength=0.7, signal_type="code", timestamp=datetime.now(timezone.utc).isoformat()))
    await engine.process_signal(Signal(source="arxiv", title="T2", confidence=0.8, strength=0.7, signal_type="code", timestamp=datetime.now(timezone.utc).isoformat()))
    filtered = engine.filter_signals(source="github")
    assert len(filtered) == 1
    assert filtered[0].source == "github"

@pytest.mark.asyncio
async def test_filter_signals_by_type(engine):
    await engine.process_signal(Signal(source="github", title="T1", confidence=0.8, strength=0.7, signal_type="type_a", timestamp=datetime.now(timezone.utc).isoformat()))
    await engine.process_signal(Signal(source="arxiv", title="T2", confidence=0.8, strength=0.7, signal_type="type_b", timestamp=datetime.now(timezone.utc).isoformat()))
    filtered = engine.filter_signals(signal_type="type_a")
    assert len(filtered) == 1
    assert filtered[0].signal_type == "type_a"

@pytest.mark.asyncio
async def test_calculate_signal_strength(engine):
    s = engine.calculate_strength([
        Signal(source="a", title="1", confidence=0.8, strength=0.7, signal_type="a", timestamp=""),
        Signal(source="a", title="2", confidence=0.9, strength=0.8, signal_type="a", timestamp="")
    ])
    assert s > 0.0

@pytest.mark.asyncio
async def test_detect_patterns(engine):
    # detect pattern should correlate signals
    for i in range(5):
        await engine.process_signal(Signal(source="a", title="test cluster", confidence=0.8, strength=0.7, signal_type="a", timestamp=datetime.now(timezone.utc).isoformat()))
    patterns = engine.detect_patterns()
    assert len(patterns) >= 1
    assert patterns[0]["type"] == "cluster"
