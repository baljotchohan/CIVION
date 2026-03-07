"""Marketplace API routes."""
from fastapi import APIRouter

router = APIRouter(prefix="/marketplace", tags=["Marketplace"])


# Mock marketplace data
_marketplace_agents = [
    {"name": "crypto_whale_tracker", "description": "Track large crypto wallet movements", "author": "community", "downloads": 1250, "rating": 4.7},
    {"name": "patent_scanner", "description": "Monitor new patent filings in tech sectors", "author": "community", "downloads": 890, "rating": 4.5},
    {"name": "regulatory_monitor", "description": "Track regulatory changes globally", "author": "civion-official", "downloads": 2100, "rating": 4.9},
    {"name": "social_pulse", "description": "Real-time social media trend detection", "author": "community", "downloads": 1560, "rating": 4.6},
]

_marketplace_personas = [
    {"name": "WarrenBuffett", "description": "Value investing analysis style", "author": "community", "downloads": 3200, "rating": 4.8},
    {"name": "ElonMusk", "description": "Disruptive technology focus", "author": "community", "downloads": 2800, "rating": 4.3},
    {"name": "SatoshiNakamoto", "description": "Cryptography and decentralization perspective", "author": "community", "downloads": 1900, "rating": 4.7},
]


@router.get("/agents")
async def marketplace_agents(query: str = ""):
    """Search marketplace agents."""
    results = _marketplace_agents
    if query:
        results = [a for a in results if query.lower() in a["name"].lower() or query.lower() in a["description"].lower()]
    return results


@router.get("/personas")
async def marketplace_personas(query: str = ""):
    """Search marketplace personas."""
    results = _marketplace_personas
    if query:
        results = [p for p in results if query.lower() in p["name"].lower() or query.lower() in p["description"].lower()]
    return results


@router.post("/install/{agent_name}")
async def install_agent(agent_name: str):
    """Install an agent from the marketplace."""
    return {"agent": agent_name, "status": "installed", "message": f"Agent '{agent_name}' installed"}


@router.post("/publish")
async def publish_agent(name: str, description: str = ""):
    """Publish an agent to the marketplace."""
    return {"name": name, "status": "published", "message": "Agent published to marketplace"}
