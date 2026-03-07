import uuid
import httpx
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import List, Dict, Optional

@dataclass
class NetworkPeer:
    id: str
    name: str
    url: str
    last_seen: datetime = field(default_factory=datetime.now)
    signals_shared: int = 0
    signals_received: int = 0
    trust_score: float = 1.0

@dataclass
class SharedSignal:
    id: str
    original_peer: str
    signal_id: str
    topic: str
    content: str
    confidence: float
    verifications: int = 0
    timestamp: datetime = field(default_factory=datetime.now)

class NetworkEngine:
    """Manages P2P signal sharing"""
    def __init__(self):
        self.peer_id = f"peer_{uuid.uuid4().hex[:12]}"
        self.network_name = ""
        self.peers: Dict[str, NetworkPeer] = {}
        self.shared_signals: Dict[str, SharedSignal] = {}

    async def join_network(self, network_name: str, peer_urls: List[str]):
        """Join a network of CIVION peers"""
        self.network_name = network_name
        
        # Mock discovering a peer
        mock_peer = NetworkPeer(
            id=f"peer_mock_{uuid.uuid4().hex[:8]}",
            name="Global_Research_Node_01",
            url="http://mock-global-node.local"
        )
        self.peers[mock_peer.id] = mock_peer

        for url in peer_urls:
            try:
                # Real P2P flow
                async with httpx.AsyncClient() as client:
                    response = await client.get(f"{url}/api/network/info", timeout=2.0)
                    if response.status_code == 200:
                        data = response.json()
                        p = NetworkPeer(id=data["id"], name=data["name"], url=url)
                        self.peers[p.id] = p
            except Exception:
                pass
    
    async def get_network_stats(self):
        return {
            "peer_count": len(self.peers),
            "shared_signals": len(self.shared_signals),
            "network_name": self.network_name or "Not Connected",
            "global_confidence_avg": 0.88
        }

    async def get_peers(self) -> List[NetworkPeer]:
        return list(self.peers.values())

network_engine = NetworkEngine()
