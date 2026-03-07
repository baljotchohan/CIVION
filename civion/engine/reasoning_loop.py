"""
CIVION Reasoning Loop
Multi-agent debate and consensus engine.
"""
from __future__ import annotations
import random
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional
from civion.core.logger import engine_logger
from civion.services.llm_service import llm_service
from civion.utils.helpers import generate_id, now_iso

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
    created_at: str = ""

    def dict(self):
        return {
            "id": self.id, "topic": self.topic, "hypothesis": self.hypothesis,
            "arguments": [a.dict() for a in self.arguments],
            "consensus": self.consensus, "final_confidence": self.final_confidence,
            "state": self.state, "created_at": self.created_at,
        }


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
        loop = ReasoningLoop(
            id=generate_id("rl"),
            topic=topic,
            hypothesis=f"Hypothesis based on: {insight[:100]}",
            state="debating",
            created_at=now_iso(),
        )

        # Simulate multi-agent debate
        agents = ["Research Monitor", "GitHub Trend", "Market Signal", "Sentiment"]
        for agent in agents:
            position = random.choice(["support", "challenge"])
            loop.arguments.append(ReasoningArgument(
                agent=agent,
                position=position,
                argument=f"{agent} analysis of '{topic[:40]}': {'supporting' if position == 'support' else 'challenging'} evidence found.",
                confidence=round(random.uniform(0.5, 0.95), 2),
            ))

        # Calculate consensus
        support_count = sum(1 for a in loop.arguments if a.position == "support")
        loop.final_confidence = round(sum(a.confidence for a in loop.arguments) / len(loop.arguments), 2)
        loop.consensus = f"{'Majority support' if support_count > len(loop.arguments) / 2 else 'Split opinion'} with {loop.final_confidence:.0%} average confidence."
        loop.state = "consensus_reached"

        self.loops.append(loop)
        log.info(f"Reasoning loop completed: {topic}")
        return loop

    async def get_loop(self, loop_id: str) -> Optional[ReasoningLoop]:
        return next((l for l in self.loops if l.id == loop_id), None)

    async def display_reasoning_loop(self, loop: ReasoningLoop) -> Dict:
        return loop.dict()


# Singleton
reasoning_engine = ReasoningEngine()
