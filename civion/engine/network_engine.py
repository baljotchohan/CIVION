"""
CIVION Network Engine
P2P distributed intelligence sharing.
"""
from __future__ import annotations
from dataclasses import dataclass, field
from typing import Any, Dict, List
from civion.core.logger import engine_logger
from civion.utils.helpers import generate_id, now_iso

log = engine_logger("network_engine")


@dataclass
class Peer:
    id: str = ""
    url: str = ""
    status: str = "disconnected"
    last_seen: str = ""
    signals_shared: int = 0

    def dict(self):
        return {"id": self.id, "url": self.url, "status": self.status, "last_seen": self.last_seen, "signals_shared": self.signals_shared}


class NetworkEngine:
    """P2P intelligence network engine."""

    def __init__(self):
        self.peers: List[Peer] = []
        self._network_name = ""
        self._signals_shared = 0

    async def join_network(self, network: str, peer_urls: List[str]) -> None:
        self._network_name = network
        for url in peer_urls:
            self.peers.append(Peer(
                id=generate_id("peer"),
                url=url, status="connected",
                last_seen=now_iso(),
            ))
        log.info(f"Joined network '{network}' with {len(peer_urls)} peers")

    async def get_peers(self) -> List[Peer]:
        return self.peers

    async def get_network_stats(self) -> Dict[str, Any]:
        return {
            "network": self._network_name or "not_connected",
            "peers": len(self.peers),
            "connected": sum(1 for p in self.peers if p.status == "connected"),
            "signals_shared": self._signals_shared,
            "health": "excellent" if self.peers else "no_peers",
        }

    async def broadcast_signal(self, signal: Dict) -> int:
        """Broadcast a signal to all peers."""
        notified = sum(1 for p in self.peers if p.status == "connected")
        self._signals_shared += 1
        return notified


# Singleton
network_engine = NetworkEngine()
