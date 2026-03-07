import pytest
from civion.engine.network_engine import network_engine

@pytest.mark.asyncio
async def test_network_join_and_stats():
    await network_engine.join_network("test-net", ["http://localhost:8000"])
    
    stats = await network_engine.get_network_stats()
    assert stats["network_name"] == "test-net"
    assert stats["peer_count"] >= 1 # Because we seeded a mock peer
