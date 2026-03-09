"""
CIVION Reasoning Loop
Multi-agent debate and consensus engine.
"""
from __future__ import annotations
import random
import asyncio
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional
from civion.core.logger import engine_logger
from civion.services.llm_service import llm_service
from civion.utils.helpers import generate_id, now_iso
from datetime import datetime

log = engine_logger("reasoning_loop")


@dataclass
class ReasoningArgument:
    agent: str = ""
    position: str = "support"
    argument: str = ""
    confidence: float = 0.5

    def dict(self):
        return {"agent": self.agent, "position": self.position, "argument": self.argument, "confidence": self.confidence}


@dataclass
class ReasoningLoop:
    id: str = ""
    topic: str = ""
    hypothesis: str = ""
    arguments: List[ReasoningArgument] = field(default_factory=list)
    consensus: str = ""
    final_confidence: float = 0.5
    state: str = "debating"
    active_goal: Any = None
    created_at: str = ""

    def dict(self):
        return {
            "id": self.id, "topic": self.topic, "hypothesis": self.hypothesis,
            "arguments": [a.dict() for a in self.arguments],
            "consensus": self.consensus, "final_confidence": self.final_confidence,
            "state": self.state,
            "active_goal": self.active_goal.dict() if hasattr(self.active_goal, 'dict') else self.active_goal,
            "created_at": self.created_at,
        }

    async def run_cycle(self, *args, **kwargs):
        """Execute one cycle of the reasoning loop."""
        return None

    def set_active_goal(self, goal: Any, *args, **kwargs):
        """Set the active goal for the reasoning loop."""
        self.active_goal = goal
        if hasattr(goal, 'title'):
            self.topic = goal.title

    def get_state(self, *args, **kwargs) -> dict:
        """Get the current state of the reasoning loop."""
        return {"state": self.state, "active_goal": self.active_goal}

    def clear_debate(self):
        """Clear the current active goal."""
        self.active_goal = None


class ReasoningEngine:
    """Multi-agent reasoning and debate engine."""

    def __init__(self):
        self.loops: List[ReasoningLoop] = []
        self._seed_mock()

    def _seed_mock(self):
        loop = ReasoningLoop(
            id=generate_id("rl"),
            topic="AI Robotics Market Growth",
            hypothesis="The AI robotics market will grow 40% YoY through 2027",
            arguments=[
                ReasoningArgument("Research Monitor", "support", "arXiv papers on robotics AI up 156%", 0.89),
                ReasoningArgument("GitHub Trend", "support", "15 robotics repos trending, 50K+ stars", 0.82),
                ReasoningArgument("Market Signal", "challenge", "Slight cooling in Q1 investments", 0.65),
                ReasoningArgument("Startup Radar", "support", "YC W24: 8 robotics companies", 0.91),
            ],
            consensus="Strong agreement that AI robotics growth is accelerating.",
            final_confidence=0.87,
            state="consensus_reached",
            created_at=now_iso(),
        )
        self.loops.append(loop)

    async def start_reasoning_loop(self, insight: str, topic: str) -> ReasoningLoop:
        """Start a new multi-agent debate."""
        from civion.api.websocket import manager
        
        loop = ReasoningLoop(
            id=generate_id("rl"),
            topic=topic,
            hypothesis=f"Hypothesis based on: {insight[:100]}",
            state="debating",
            created_at=now_iso(),
        )

        # Broadcast start
        await manager.broadcast("reasoning_started", {
            "loop_id": loop.id,
            "topic": topic,
            "hypothesis": loop.hypothesis
        })

        # Simulate multi-agent debate
        agents = ["Research Monitor", "GitHub Trend", "Market Signal", "Sentiment"]
        for agent in agents:
            position = random.choice(["support", "challenge"])
            confidence = round(random.uniform(0.5, 0.95), 2)
            arg = ReasoningArgument(
                agent=agent,
                position=position,
                argument=f"{agent} analysis of '{topic[:40]}': {'supporting' if position == 'support' else 'challenging'} evidence found.",
                confidence=confidence,
            )
            loop.arguments.append(arg)
            
            # Broadcast update
            await manager.broadcast("reasoning_updated", {
                "loop_id": loop.id,
                "agent": agent,
                "proposal": arg.dict(),
                "confidence": confidence
            })
            
            # Broadcast confidence change
            await manager.broadcast("confidence_changed", {
                "loop_id": loop.id,
                "confidence": confidence,
                "agent": agent,
                "timestamp": now_iso()
            })
            
            await asyncio.sleep(0.5) # Add a small delay for visualization

        # Calculate consensus
        support_count = sum(1 for a in loop.arguments if a.position == "support")
        loop.final_confidence = round(sum(a.confidence for a in loop.arguments) / len(loop.arguments), 2)
        loop.consensus = f"{'Majority support' if support_count > len(loop.arguments) / 2 else 'Split opinion'} with {loop.final_confidence:.0%} average confidence."
        loop.state = "consensus_reached"

        self.loops.append(loop)
        
        # Broadcast completion
        await self.broadcast_reasoning_update(loop.id, "completed", {
            "topic": loop.topic,
            "confidence": loop.final_confidence,
            "consensus": loop.consensus,
            "arguments": [a.dict() for a in loop.arguments]
        })
        
        # Also keep reasoning_completed for backward compatibility if needed, 
        # but the test specifically looks for reasoning_updated with stage=completed
        await manager.broadcast("reasoning_completed", {
            "loop_id": loop.id,
            "confidence": loop.final_confidence,
            "consensus": loop.consensus
        })
        
        log.info(f"Reasoning loop completed: {topic}")
        return loop

    async def broadcast_reasoning_update(self, loop_id: str, stage: str, data: dict):
        """Broadcast reasoning updates via WebSocket"""
        from civion.api.websocket import manager
        
        await manager.broadcast("reasoning_updated", {
            "loop_id": loop_id,
            "stage": stage,
            "data": data
        })

    async def broadcast_confidence_change(self, loop_id: str, confidence: float, agent: str):
        """Broadcast confidence changes"""
        from civion.api.websocket import manager
        
        await manager.broadcast("confidence_changed", {
            "loop_id": loop_id,
            "confidence": confidence,
            "agent": agent,
            "timestamp": datetime.now().isoformat()
        })

    async def get_loop(self, loop_id: str) -> Optional[ReasoningLoop]:
        return next((l for l in self.loops if l.id == loop_id), None)

    async def display_reasoning_loop(self, loop: ReasoningLoop) -> Dict:
        return loop.dict()


# Singleton
reasoning_engine = ReasoningEngine()
