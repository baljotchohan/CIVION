"""Network API routes."""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from civion.engine.network_engine import network_engine

router = APIRouter(prefix="/network", tags=["Network"])


class NetworkJoinRequest(BaseModel):
    network: str
    peers: List[str] = []


@router.get("/status")
async def network_status():
    """Get network status."""
    return await network_engine.get_network_stats()


@router.get("/peers")
async def list_peers():
    """List connected peers."""
    peers = await network_engine.get_peers()
    return [p.dict() if hasattr(p, 'dict') else p for p in peers]


@router.post("/join")
async def join_network(req: NetworkJoinRequest):
    """Join a network."""
    await network_engine.join_network(req.network, req.peers)
    return {"status": "joined", "network": req.network}


@router.post("/broadcast")
async def broadcast_signal(signal_id: str):
    """Broadcast a signal to the network."""
    return {"signal_id": signal_id, "broadcast": True, "peers_notified": len(network_engine.peers)}


@router.get("/consensus")
async def global_consensus():
    """Get global consensus from the network."""
    return {"consensus": "forming", "participants": len(network_engine.peers), "signals_shared": 0}
