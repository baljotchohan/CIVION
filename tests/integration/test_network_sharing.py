import pytest
import asyncio
from unittest.mock import AsyncMock, MagicMock
from civion.engine.network_engine import NetworkEngine
from civion.core.events import EventBus

@pytest.fixture
def network():
    engine = NetworkEngine()
    engine.session = AsyncMock()
    return engine

@pytest.mark.asyncio
async def test_join_network_success(network):
    """Test successful network join sets up peers"""
    network.session.post.return_value.__aenter__.return_value.status = 200
    network.session.post.return_value.__aenter__.return_value.json = AsyncMock(return_value={"status": "ok", "peers": ["node1", "node2"]})
    result = await network.join_network()
    assert result is True
    assert network.is_connected is True
    assert "node1" in network.peers

@pytest.mark.asyncio
async def test_join_network_already_joined(network):
    """Test redundant joins return early"""
    network.is_connected = True
    result = await network.join_network()
    assert result is True
    network.session.post.assert_not_called()

@pytest.mark.asyncio
async def test_leave_network(network):
    """Test disconnect and peer list clear"""
    network.is_connected = True
    network.peers = ["node1"]
    await network.leave_network()
    assert network.is_connected is False
    assert len(network.peers) == 0

@pytest.mark.asyncio
async def test_broadcast_signal_to_empty_network(network):
    """Test broadcast with no peers returns silently"""
    network.peers = set()
    result = await network.broadcast_signal({"id": "sig1"})
    assert result == 0

@pytest.mark.asyncio
async def test_broadcast_signal_with_peers(network):
    """Test broadcast loops through peers"""
    network.peers = {"http://node1", "http://node2"}
    network.session.post.return_value.__aenter__.return_value.status = 200
    res = await network.broadcast_signal({"id": "sig2"})
    assert res == 2
    assert network.session.post.call_count == 2

@pytest.mark.asyncio
async def test_receive_signal_from_peer(network):
    """Test handling valid incoming signal"""
    EventBus.publish = AsyncMock()
    await network.receive_signal({"id": "sig3", "title": "Test", "source": "peer"})
    assert "sig3" in network.seen_signals
    EventBus.publish.assert_called_once()

@pytest.mark.asyncio
async def test_consensus_calculation_majority(network):
    """Test distributed consensus resolution"""
    network.peers = {"http://node1", "http://node2", "http://node3"}
    # 2 agree, 1 disagree
    network.session.post.return_value.__aenter__.return_value.json = AsyncMock(side_effect=[
        {"vote": True}, {"vote": True}, {"vote": False}
    ])
    result = await network.calculate_consensus("claim_123")
    assert result is True

@pytest.mark.asyncio
async def test_peer_list_not_empty_after_join(network):
    """Test peer persistence"""
    network.session.post.return_value.__aenter__.return_value.status = 200
    network.session.post.return_value.__aenter__.return_value.json = AsyncMock(return_value={"status": "ok", "peers": ["p1"]})
    await network.join_network()
    assert len(network.peers) > 0

@pytest.mark.asyncio
async def test_network_status_returns_health(network):
    """Test status aggregation"""
    network.is_connected = True
    network.peers = {"http://p1"}
    status = network.get_network_status()
    assert status["connected"] is True
    assert status["peer_count"] == 1

@pytest.mark.asyncio
async def test_duplicate_signal_rejected(network):
    """Test signal deduplication prevents loops"""
    network.seen_signals.add("sig4")
    EventBus.publish = AsyncMock()
    await network.receive_signal({"id": "sig4"})
    EventBus.publish.assert_not_called()
