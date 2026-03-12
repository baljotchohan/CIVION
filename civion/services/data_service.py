"""
CIVION Data Service
Central data persistence layer.
"""
from __future__ import annotations
import json
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from civion.core.logger import get_logger

log = get_logger("data")


class DataService:
    """Central persistence layer for all CIVION data."""

    def __init__(self):
        self._goals: Dict[str, Dict] = {}
        self._insights: Dict[str, Dict] = {}
        self._signals: Dict[str, Dict] = {}
        self._predictions: Dict[str, Dict] = {}
        self._events: List[Dict] = []
        self._agent_logs: Dict[str, List[Dict]] = {}

    # ── Goals ────────────────────────────────────────
    async def save_goal(self, goal: Dict) -> str:
        if "id" not in goal:
            goal["id"] = str(uuid.uuid4())[:8]
        goal["updated_at"] = datetime.now(timezone.utc).isoformat()
        self._goals[goal["id"]] = goal
        return goal["id"]

    async def get_goal(self, goal_id: str) -> Optional[Dict]:
        if goal_id in self._goals:
            return self._goals[goal_id]
        
        # Try prefix match for truncated CLI IDs
        matches = [g for i, g in self._goals.items() if i.startswith(goal_id)]
        return matches[0] if matches else None

    async def list_goals(self) -> List[Dict]:
        return list(self._goals.values())

    async def delete_goal(self, goal_id: str) -> bool:
        return self._goals.pop(goal_id, None) is not None

    # ── Insights ─────────────────────────────────────
    async def save_insight(self, insight: Dict) -> str:
        if "id" not in insight:
            insight["id"] = str(uuid.uuid4())[:8]
        insight["created_at"] = datetime.now(timezone.utc).isoformat()
        self._insights[insight["id"]] = insight
        return insight["id"]

    async def list_insights(self, limit: int = 50) -> List[Dict]:
        items = sorted(
            self._insights.values(),
            key=lambda x: x.get("created_at", ""),
            reverse=True,
        )
        return items[:limit]

    async def get_insight(self, insight_id: str) -> Optional[Dict]:
        return self._insights.get(insight_id)

    # ── Signals ──────────────────────────────────────
    async def save_signal(self, signal: Dict) -> str:
        if "id" not in signal:
            signal["id"] = str(uuid.uuid4())[:8]
        signal["detected_at"] = datetime.now(timezone.utc).isoformat()
        self._signals[signal["id"]] = signal
        return signal["id"]

    async def list_signals(self, source: Optional[str] = None, limit: int = 50) -> List[Dict]:
        items = list(self._signals.values())
        if source:
            items = [s for s in items if s.get("source") == source]
        items.sort(key=lambda x: x.get("detected_at", ""), reverse=True)
        return items[:limit]

    async def get_signal(self, signal_id: str) -> Optional[Dict]:
        return self._signals.get(signal_id)

    # ── Predictions ──────────────────────────────────
    async def save_prediction(self, prediction: Dict) -> str:
        if "id" not in prediction:
            prediction["id"] = str(uuid.uuid4())[:8]
        self._predictions[prediction["id"]] = prediction
        return prediction["id"]

    async def list_predictions(self) -> List[Dict]:
        return list(self._predictions.values())

    async def get_prediction(self, pred_id: str) -> Optional[Dict]:
        return self._predictions.get(pred_id)

    # ── Events ───────────────────────────────────────
    async def log_event(self, event: Dict) -> None:
        event["timestamp"] = datetime.now(timezone.utc).isoformat()
        self._events.append(event)
        if len(self._events) > 1000:
            self._events = self._events[-500:]

    async def get_events(self, limit: int = 50, event_type: Optional[str] = None) -> List[Dict]:
        items = self._events
        if event_type:
            items = [e for e in items if e.get("type") == event_type]
        return list(reversed(items[-limit:]))

    # ── Agent Logs ───────────────────────────────────
    async def log_agent_activity(self, agent_name: str, entry: Dict) -> None:
        if agent_name not in self._agent_logs:
            self._agent_logs[agent_name] = []
        entry["timestamp"] = datetime.now(timezone.utc).isoformat()
        self._agent_logs[agent_name].append(entry)
        if len(self._agent_logs[agent_name]) > 500:
            self._agent_logs[agent_name] = self._agent_logs[agent_name][-250:]

    async def get_agent_logs(self, agent_name: str, limit: int = 50) -> List[Dict]:
        logs = self._agent_logs.get(agent_name, [])
        return list(reversed(logs[-limit:]))

    # ── Stats ────────────────────────────────────────
    async def get_stats(self) -> Dict[str, int]:
        return {
            "goals": len(self._goals),
            "insights": len(self._insights),
            "signals": len(self._signals),
            "predictions": len(self._predictions),
            "events": len(self._events),
        }


# Singleton
data_service = DataService()
