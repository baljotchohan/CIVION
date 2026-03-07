"""Insight API routes."""
from fastapi import APIRouter, HTTPException
from civion.services.data_service import data_service

router = APIRouter(prefix="/insights", tags=["Insights"])


@router.get("")
async def list_insights(limit: int = 50):
    """List all insights."""
    return await data_service.list_insights(limit=limit)


@router.get("/{insight_id}")
async def get_insight(insight_id: str):
    """Get insight details."""
    insight = await data_service.get_insight(insight_id)
    if not insight:
        raise HTTPException(404, "Insight not found")
    return insight


@router.get("/search/{query}")
async def search_insights(query: str):
    """Search insights by keyword."""
    from civion.services.memory_service import memory_service
    nodes = await memory_service.recall(query, category="insight")
    return [{"id": n.id, "content": n.content, "relevance": n.relevance_score} for n in nodes]
