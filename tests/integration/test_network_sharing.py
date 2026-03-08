import pytest
import asyncio
from unittest.mock import AsyncMock, patch
from civion.engine.network_engine import NetworkEngine, Peer

@pytest.fixture
def network():
    return NetworkEngine()

@pytest.mark.asyncio
async def test_network_engine_initialization(network):
    """Test initial attributes of the network engine."""
    assert len(network.peers) == 0
    assert network._network_name == ""
    assert network._signals_shared == 0

@pytest.mark.asyncio
async def test_join_network_adds_peers(network):
    """Test join_network adds peers to the list."""
    await network.join_network("test-net", ["http://peer1", "http://peer2"])
    assert len(network.peers) == 2
    assert network._network_name == "test-net"

@pytest.mark.asyncio
async def test_peer_id_generation(network):
    """Test that peers get unique generated IDs."""
    await network.join_network("net", ["http://p1", "http://p2"])
    assert network.peers[0].id != network.peers[1].id
    assert network.peers[0].id.startswith("peer_")

@pytest.mark.asyncio
async def test_get_peers_returns_list(network):
    """Test getting peer objects."""
    await network.join_network("net", ["http://p1"])
    peers = await network.get_peers()
    assert isinstance(peers, list)
    assert peers[0].url == "http://p1"

@pytest.mark.asyncio
async def test_get_network_stats_basic(network):
    """Test initial stats without peers."""
    stats = await network.get_network_stats()
    assert stats["network_name"] == "not_connected"
    assert stats["peer_count"] == 0
    assert stats["health"] == "no_peers"

@pytest.mark.asyncio
async def test_get_network_stats_populated(network):
    """Test stats after joining a network."""
    await network.join_network("alpha", ["http://1"])
    stats = await network.get_network_stats()
    assert stats["network_name"] == "alpha"
    assert stats["peer_count"] == 1
    assert stats["connected"] == 1
    assert stats["health"] == "excellent"

@pytest.mark.asyncio
async def test_broadcast_signal_returns_count(network):
    """Test broadcasting returns number of connected peers."""
    await network.join_network("net", ["http://p1", "http://p2"])
    count = await network.broadcast_signal({"data": 123})
    assert count == 2

@pytest.mark.asyncio
async def test_broadcast_signal_increments_metric(network):
    """Test shared signal counter increments."""
    await network.join_network("net", ["http://p"])
    await network.broadcast_signal({})
    await network.broadcast_signal({})
    stats = await network.get_network_stats()
    assert stats["signals_shared"] == 2

@pytest.mark.asyncio
async def test_peer_last_seen_tracking(network):
    """Test that peers have a last_seen timestamp."""
    await network.join_network("net", ["http://p"])
    assert network.peers[0].last_seen != ""

@pytest.mark.asyncio
async def test_peer_serialization_structure(network):
    """Test Peer.dict() structure."""
    await network.join_network("net", ["http://p"])
    p_dict = network.peers[0].dict()
    assert "id" in p_dict
    assert "url" in p_dict
    assert "status" in p_dict
    assert p_dict["url"] == "http://p"

@pytest.mark.asyncio
async def test_broadcast_signal_no_peers(network):
    """Test broadcasting when no peers are present."""
    count = await network.broadcast_signal({"msg": "hi"})
    assert count == 0

@pytest.mark.asyncio
async def test_multiple_joins_append_peers(network):
    """Test that consecutive joins append to the peer list."""
    await network.join_network("net1", ["http://1"])
    await network.join_network("net2", ["http://2"])
    assert len(network.peers) == 2
    assert network._network_name == "net2"
