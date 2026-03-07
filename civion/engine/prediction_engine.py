import uuid
import json
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from civion.models.prediction import Prediction

class PredictionEngine:
    """Generates and tracks predictions"""
    def __init__(self):
        self._predictions: Dict[str, Prediction] = {}
        # Pre-seed some predictions for demonstration
        self._seed_mock_data()

    def _seed_mock_data(self):
        p1 = Prediction(
            id=f"pred_{uuid.uuid4().hex[:12]}",
            event="Robot IPO Wave",
            description="Massive IPO wave for leading robotics companies",
            confidence=0.85,
            predicted_date=datetime.now() + timedelta(days=90),
            supporting_factors=["GitHub growth", "Funding surge", "Media buzz"],
            risk_factors=["Market downturn", "Competition"]
        )
        self._predictions[p1.id] = p1

    async def generate_predictions(self, insights: List[Dict]) -> List[Prediction]:
        """
        Analyze current insights and predict future trends.
        """
        # normally we format insights and call LLM
        # For implementation, we'll mock creating one based on insights
        
        prediction = Prediction(
            id=f"pred_{uuid.uuid4().hex[:12]}",
            event="AI Agent Hardware Breakthrough",
            description="New dedicated neural processors for local agents",
            confidence=0.72,
            predicted_date=datetime.now() + timedelta(days=45),
            supporting_factors=["arXiv papers", "Patent filings"],
            risk_factors=["Manufacturing delays"]
        )
        self._predictions[prediction.id] = prediction
        return [prediction]
    
    async def verify_prediction(self, prediction_id: str, occurred: bool):
        """Mark prediction as correct or incorrect"""
        if prediction_id in self._predictions:
            pred = self._predictions[prediction_id]
            pred.actual_date = datetime.now()
            pred.accuracy = occurred

    async def get_all_predictions(self) -> List[Prediction]:
        return list(self._predictions.values())

    async def get_prediction_accuracy(self) -> Dict:
        """Calculate overall prediction accuracy"""
        all_pred = await self.get_all_predictions()
        completed = [p for p in all_pred if p.accuracy is not None]
        
        if not completed:
            return {"accuracy": 0, "total": 0, "pending": len(all_pred)}
        
        correct = sum(1 for p in completed if p.accuracy)
        
        return {
            "accuracy": correct / len(completed),
            "correct": correct,
            "total": len(completed),
            "pending": len(all_pred) - len(completed)
        }

prediction_engine = PredictionEngine()
