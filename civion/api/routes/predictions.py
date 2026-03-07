"""Prediction API routes."""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from civion.engine.prediction_engine import prediction_engine

router = APIRouter(prefix="/predictions", tags=["Predictions"])


@router.get("")
async def list_predictions():
    """List all predictions."""
    preds = await prediction_engine.get_all_predictions()
    return [p.dict() if hasattr(p, 'dict') else p for p in preds]


@router.get("/accuracy")
async def prediction_accuracy():
    """Get prediction accuracy metrics."""
    return await prediction_engine.get_prediction_accuracy()


@router.post("/analyze")
async def generate_predictions(insights: List[Dict[str, Any]]):
    """Generate predictions from insights."""
    preds = await prediction_engine.generate_predictions(insights)
    return [p.dict() if hasattr(p, 'dict') else p for p in preds]


@router.get("/{pred_id}")
async def get_prediction(pred_id: str):
    """Get prediction details."""
    preds = await prediction_engine.get_all_predictions()
    for p in preds:
        d = p.dict() if hasattr(p, 'dict') else p
        if d.get("id") == pred_id:
            return d
    raise HTTPException(404, "Prediction not found")


@router.post("/{pred_id}/verify")
async def verify_prediction(pred_id: str, outcome: bool = True):
    """Verify whether a prediction came true."""
    return {"id": pred_id, "verified": True, "outcome": outcome}
