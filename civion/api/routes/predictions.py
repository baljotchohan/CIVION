"""Prediction API routes."""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from civion.engine.prediction_engine import prediction_engine

router = APIRouter(prefix="/predictions", tags=["Predictions"])


@router.get("")
async def list_predictions(category: Optional[str] = None, min_confidence: float = 0.0):
    """List all predictions with optional filtering."""
    preds = await prediction_engine.get_all_predictions()
    results = []
    for p in preds:
        d = p.dict() if hasattr(p, 'dict') else p
        if category and d.get("category") != category: continue
        if d.get("confidence", 1.0) < min_confidence: continue
        results.append(d)
    return results


@router.get("/stats")
async def prediction_stats():
    """Get detailed prediction statistics."""
    preds = await prediction_engine.get_all_predictions()
    total = len(preds)
    verified = sum(1 for p in preds if (p.dict() if hasattr(p, 'dict') else p).get("verified"))
    correct = sum(1 for p in preds if (p.dict() if hasattr(p, 'dict') else p).get("outcome") is True)
    
    return {
        "total": total,
        "verified": verified,
        "accuracy": (correct / verified) if verified > 0 else 0.0,
        "by_category": {} # Placeholder for breakdown
    }


@router.get("/accuracy")
async def prediction_accuracy():
    """Get prediction accuracy metrics (Legacy)."""
    return await prediction_engine.get_prediction_accuracy()


@router.post("/analyze")
async def generate_predictions(payload: Dict[str, Any]):
    """Generate predictions from insights. Accepts single insight or list."""
    goal = payload.get("goal") or payload.get("content") or "Analysis Request"
    preds = await prediction_engine.analyze(goal)
    return [p if isinstance(p, dict) else p.dict() for p in preds]


@router.get("/{pred_id}")
async def get_prediction(pred_id: str):
    """Get prediction details."""
    p = await prediction_engine.get_prediction(pred_id)
    if not p:
        raise HTTPException(404, "Prediction not found")
    return p.dict() if hasattr(p, 'dict') else p


@router.post("/{pred_id}/verify")
async def verify_prediction(pred_id: str, outcome: bool = True):
    """Verify whether a prediction came true."""
    success = await prediction_engine.verify_prediction(pred_id, outcome)
    if not success:
        raise HTTPException(404, "Prediction not found or already verified")
    return {"id": pred_id, "verified": True, "outcome": outcome}


@router.delete("/{pred_id}")
async def delete_prediction(pred_id: str):
    """Remove a prediction record."""
    success = await prediction_engine.delete_prediction(pred_id)
    if not success:
        raise HTTPException(404, "Prediction not found")
    return {"id": pred_id, "deleted": True}
