"""Memory API routes."""
from fastapi import APIRouter
from civion.services.memory_service import memory_service

router = APIRouter(prefix="/memory", tags=["Memory"])


@router.get("")
async def memory_graph():
    """Get the knowledge graph."""
    return memory_service.to_dict()


@router.get("/stats")
async def memory_stats():
    """Get memory service statistics."""
    return await memory_service.get_stats()


@router.get("/search/{query}")
async def search_memory(query: str, limit: int = 10):
    """Search the knowledge graph."""
    nodes = await memory_service.recall(query, limit=limit)
    return [{
        "id": n.id,
        "content": n.content,
        "category": n.category,
        "tags": n.tags,
        "relevance": n.relevance_score,
    } for n in nodes]
