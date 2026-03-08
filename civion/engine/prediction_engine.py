import asyncio
import logging
from typing import List, Optional, Dict
from uuid import uuid4
from datetime import datetime

from civion.api.websocket import manager

logger = logging.getLogger(__name__)

class PredictionEngine:
    """Generates market and trend predictions based on aggregate signal data."""
    
    def __init__(self):
        self.predictions = []
        self._lock = asyncio.Lock()

    async def analyze(self, goal: str, signals_context: List[dict] = None) -> List[dict]:
        """
        Analyze a specific goal/topic and generate a formal Prediction.
        """
        pred_id = f"pred_{uuid4().hex[:8]}"
        
        # Determine confidence/probability based on number of signals (mock heuristic)
        base_prob = 0.65
        evidence = [f"Analysis triggered for: {goal}"]
        
        if signals_context and len(signals_context) > 0:
            base_prob = min(0.98, base_prob + (len(signals_context) * 0.05))
            evidence.append(f"Correlated against {len(signals_context)} active network signals")
            
        prediction = {
            "id": pred_id,
            "title": f"Forecast: {goal[:50]}...",
            "description": f"Engine analysis suggests high probability outcome for {goal}.",
            "probability": round(base_prob, 2),
            "timeframe": "Next 30 days",
            "evidence": evidence,
            "created_at": datetime.utcnow().isoformat() + "Z",
            "resolved": False,
            "outcome": None,
            "accuracy": None,
            "shared_count": 0,
            "tags": ["forecast", "auto-generated"]
        }
        
        async with self._lock:
            self.predictions.append(prediction)
            
        logger.info(f"PredictionEngine generated prediction: {pred_id}")
        
        # Broadcast via WebSocket precisely as specified
        await manager.broadcast("prediction_made", prediction)
        
        return [prediction]
        
    async def get_all_predictions(self) -> List[dict]:
        async with self._lock:
            return sorted(self.predictions, key=lambda x: x["created_at"], reverse=True)
            
    async def resolve_prediction(self, pred_id: str, outcome: bool, accuracy: float) -> Optional[dict]:
        async with self._lock:
            for p in self.predictions:
                if p["id"] == pred_id:
                    p["resolved"] = True
                    p["outcome"] = outcome
                    p["accuracy"] = accuracy
                    return p
        return None

    async def generate_predictions(self, insights: List[dict]) -> List[dict]:
        """Alias for analyze when processing insights."""
        if not insights:
            return []
        # Use first insight goal or generic topic
        goal = insights[0].get("content") or insights[0].get("goal") or "Aggregated Insights"
        return await self.analyze(goal, insights)

prediction_engine = PredictionEngine()
