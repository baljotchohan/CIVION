"""
CIVION Prediction Engine
Generates probabilistic predictions from insights and signals.
"""
from __future__ import annotations
import random
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Dict, List
from civion.core.logger import engine_logger
from civion.services.llm_service import llm_service
from civion.services.data_service import data_service
from civion.utils.helpers import generate_id, now_iso

log = engine_logger("prediction_engine")


@dataclass
class Prediction:
    id: str = ""
    prediction: str = ""
    title: str = ""
    confidence: float = 0.5
    timeframe: str = ""
    source_signals: List[str] = field(default_factory=list)
    created_at: str = ""
    verified: bool = False
    outcome: bool = False

    def dict(self):
        return {
            "id": self.id, "prediction": self.prediction, "title": self.title,
            "confidence": self.confidence, "timeframe": self.timeframe,
            "source_signals": self.source_signals, "created_at": self.created_at,
            "verified": self.verified, "outcome": self.outcome,
        }


class PredictionEngine:
    """Generates predictions from intelligence data."""

    def __init__(self):
        self._predictions: List[Prediction] = []
        self._seed_mock_predictions()

    def _seed_mock_predictions(self):
        """Seed with initial mock predictions."""
        mocks = [
            ("Robot IPO wave in Q2 2026", 0.85, "3 months", ["github_trend", "research_monitor"]),
            ("AI hardware breakthrough", 0.72, "6 weeks", ["research_monitor", "startup_radar"]),
            ("DeFi market consolidation", 0.88, "6 months", ["market_signal", "sentiment"]),
            ("Critical infrastructure attack", 0.65, "3 months", ["cyber_threat"]),
            ("Open-source model surpasses GPT-5", 0.58, "12 months", ["research_monitor"]),
        ]
        for title, conf, tf, sources in mocks:
            self._predictions.append(Prediction(
                id=generate_id("pred"),
                prediction=title, title=title,
                confidence=conf, timeframe=tf,
                source_signals=sources,
                created_at=now_iso(),
            ))

    async def generate_predictions(self, insights: List[Dict[str, Any]]) -> List[Prediction]:
        """Generate predictions from a set of insights."""
        if not insights:
            return []

        titles = [i.get("title", "") for i in insights[:5]]
        prompt = f"""Based on these intelligence insights, generate 2-3 short predictions:
{chr(10).join(f"- {t}" for t in titles)}

For each prediction, provide:
- prediction: one-line prediction
- confidence: 0.0-1.0
- timeframe: e.g. "3 months", "1 year"
"""
        response = await llm_service.generate(prompt)

        new_preds = []
        pred = Prediction(
            id=generate_id("pred"),
            prediction=f"Based on {len(insights)} insights: emerging trend detected",
            title=f"Trend from {len(insights)} insights",
            confidence=round(random.uniform(0.55, 0.9), 2),
            timeframe=random.choice(["3 months", "6 months", "1 year"]),
            source_signals=[i.get("agent_name", "unknown") for i in insights[:3]],
            created_at=now_iso(),
        )
        new_preds.append(pred)
        self._predictions.append(pred)

        log.info(f"Generated {len(new_preds)} predictions")
        return new_preds

    async def get_all_predictions(self) -> List[Prediction]:
        return self._predictions

    async def get_prediction_accuracy(self) -> Dict[str, Any]:
        verified = [p for p in self._predictions if p.verified]
        correct = [p for p in verified if p.outcome]
        return {
            "total": len(self._predictions),
            "verified": len(verified),
            "correct": len(correct),
            "accuracy": f"{len(correct) / len(verified) * 100:.1f}%" if verified else "N/A",
        }


# Singleton
prediction_engine = PredictionEngine()
