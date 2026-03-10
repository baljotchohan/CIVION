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


from civion.agents import GitHubAgent, ResearchAgent, MarketAgent
from civion.api.websocket import manager


class ReasoningEngine:
    """Multi-agent reasoning and debate engine."""

    def __init__(self):
        self.loops: List[ReasoningLoop] = []

    async def start_reasoning_loop(self, insight: str, topic: str) -> dict:
        """Start reasoning with real agents"""
        
        # Create reasoning loop ID
        loop_id = generate_id("rl")
        
        # Broadcast start
        await manager.broadcast('reasoning_started', {
            'reasoning_id': loop_id,
            'topic': topic,
            'hypothesis': insight,
            'timestamp': datetime.now().isoformat()
        })
        
        # Initialize agents
        agents = [
            GitHubAgent(),
            ResearchAgent(),
            MarketAgent()
        ]
        
        arguments = []
        confidences = []
        
        # Run all agents in parallel
        try:
            results = await asyncio.gather(
                *[agent.analyze(topic) for agent in agents],
                return_exceptions=True
            )
            
            for agent, result in zip(agents, results):
                # Handle errors
                if isinstance(result, Exception):
                    log.error(f"{agent.name} failed: {str(result)}")
                    continue
                
                # Add argument
                arg = {
                    "agent": result.get('agent', agent.name),
                    "position": result.get('position', 'support'),
                    "argument": result.get('analysis', ''),
                    "confidence": result.get('confidence', 0.5),
                    "raw_data": result.get('data', {})
                }
                arguments.append(arg)
                confidences.append(result.get('confidence', 0.5))
                
                # Broadcast agent update
                await manager.broadcast('reasoning_updated', {
                    'reasoning_id': loop_id,
                    'agent': result.get('agent', agent.name),
                    'argument': result.get('analysis', ''),
                    'confidence': result.get('confidence', 0.5),
                    'timestamp': datetime.now().isoformat()
                })
                
                # Update confidence, broadcast
                if confidences:
                    avg_confidence = sum(confidences) / len(confidences)
                    await manager.broadcast('confidence_changed', {
                        'reasoning_id': loop_id,
                        'confidence': avg_confidence,
                        'timestamp': datetime.now().isoformat()
                    })
        
        except Exception as e:
            log.error(f"Reasoning loop error: {str(e)}")
            await manager.broadcast('reasoning_error', {
                'reasoning_id': loop_id,
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            })
        
        # Synthesize consensus
        if arguments:
            consensus = await self._synthesize_consensus(arguments)
            final_confidence = sum(confidences) / len(confidences) if confidences else 0.5
        else:
            consensus = "Unable to analyze topic"
            final_confidence = 0.0
        
        # Create loop object for record
        loop_data = {
            'id': loop_id,
            'topic': topic,
            'hypothesis': insight,
            'arguments': arguments,
            'consensus': consensus,
            'final_confidence': final_confidence,
            'state': 'completed',
            'created_at': now_iso()
        }
        
        # Broadcast completion
        await manager.broadcast('reasoning_completed', {
            'reasoning_id': loop_id,
            'consensus': consensus,
            'final_confidence': final_confidence,
            'argument_count': len(arguments),
            'timestamp': datetime.now().isoformat()
        })
        
        log.info(f"Reasoning loop completed: {topic}")
        return loop_data
    
    async def _synthesize_consensus(self, arguments: list) -> str:
        """Use LLM to synthesize consensus"""
        from civion.services.llm_service import llm_service
        
        args_text = "\n".join([f"- {arg['agent']}: {arg['argument']}" for arg in arguments])
        
        prompt = f"""
        Synthesize these agent analyses into one consensus statement (2-3 sentences):
        
        {args_text}
        
        Consensus:
        """
        
        return await llm_service.complete(prompt)

    async def get_loop(self, loop_id: str) -> Optional[Dict]:
        # Note: In a real system we'd persist this. For now we returns from memory if we added them.
        # But the guide doesn't show a persistence layer here. 
        # I'll just return None or a mock if needed for now to satisfy imports.
        return None


# Singleton
reasoning_engine = ReasoningEngine()
