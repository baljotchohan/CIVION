"""
CIVION Goal Planner
Decomposes high-level intelligence goals into executable tasks.
"""
from __future__ import annotations
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
from civion.core.constants import GoalState
from civion.core.logger import engine_logger
from civion.services.llm_service import llm_service
from civion.services.data_service import data_service
from civion.utils.helpers import generate_id, now_iso

log = engine_logger("goal_planner")


class GoalPlanner:
    """Decomposes goals into tasks and manages execution."""

    async def create_goal(self, title: str, description: str = "", priority: int = 5) -> Dict:
        """Create a new intelligence goal."""
        goal = {
            "id": generate_id("goal"),
            "title": title,
            "description": description,
            "state": GoalState.CREATED.value,
            "priority": priority,
            "tasks": [],
            "progress": 0.0,
            "created_at": now_iso(),
            "updated_at": now_iso(),
        }
        await data_service.save_goal(goal)
        log.info(f"Goal created: {title}")
        return goal

    async def decompose(self, goal_id: str) -> Dict:
        """Decompose a goal into executable tasks."""
        goal = await data_service.get_goal(goal_id)
        if not goal:
            return {"error": "Goal not found"}

        prompt = f"""Decompose this intelligence goal into 3-5 specific, actionable tasks.

Goal: {goal['title']}
Description: {goal.get('description', 'N/A')}

Return a JSON array of tasks, each with:
- "title": task title
- "agent": which agent should handle it (github_trend, research_monitor, startup_radar, market_signal, cyber_threat, sentiment)
- "priority": 1-10 priority
- "description": what to do
"""
        response = await llm_service.generate(prompt)

        # Parse or create default tasks
        try:
            import json
            tasks = json.loads(response)
            if not isinstance(tasks, list):
                tasks = [tasks]
        except Exception:
            tasks = [
                {"title": f"Scan sources for: {goal['title']}", "agent": "github_trend", "priority": 8, "description": "Search GitHub for related projects"},
                {"title": f"Research papers on: {goal['title']}", "agent": "research_monitor", "priority": 7, "description": "Search arXiv for related papers"},
                {"title": f"Market analysis for: {goal['title']}", "agent": "market_signal", "priority": 6, "description": "Analyze market implications"},
                {"title": f"Sentiment analysis for: {goal['title']}", "agent": "sentiment", "priority": 5, "description": "Gauge sentiment around topic"},
            ]

        for i, task in enumerate(tasks):
            task["id"] = generate_id("task")
            task["status"] = "pending"
            task["created_at"] = now_iso()

        goal["tasks"] = tasks
        goal["state"] = GoalState.DECOMPOSED.value
        goal["updated_at"] = now_iso()
        await data_service.save_goal(goal)

        log.info(f"Goal decomposed into {len(tasks)} tasks")
        return goal

    async def execute_goal(self, goal_id: str) -> dict:
        """Execute goal by starting reasoning"""
        from civion.api.websocket import manager
        from civion.engine.reasoning_loop import reasoning_engine
        
        # Get goal
        goal = await self.get_goal(goal_id)
        if not goal:
            from fastapi import HTTPException
            raise HTTPException(404, "Goal not found")
        
        # Broadcast goal started
        await manager.broadcast('goal_started', {
            'goal_id': goal_id,
            'title': goal.get('title'),
            'timestamp': datetime.now().isoformat()
        })
        
        # Start reasoning
        reasoning = await reasoning_engine.start_reasoning_loop(
            insight=goal.get('title', ''),
            topic=goal.get('description', '')
        )
        
        # Update goal with results
        goal['reasoning_id'] = reasoning['id']
        goal['state'] = GoalState.COMPLETED.value
        goal['final_confidence'] = reasoning['final_confidence']
        goal['consensus'] = reasoning['consensus']
        goal['arguments'] = reasoning['arguments']
        
        # Save
        await data_service.save_goal(goal)
        
        # Broadcast completion
        await manager.broadcast('goal_completed', {
            'goal_id': goal_id,
            'reasoning_id': reasoning['id'],
            'confidence': reasoning['final_confidence'],
            'timestamp': datetime.now().isoformat()
        })
        
        return goal

    async def get_goal(self, goal_id: str) -> Optional[Dict]:
        return await data_service.get_goal(goal_id)

    async def list_goals(self) -> List[Dict]:
        return await data_service.list_goals()

    async def delete_goal(self, goal_id: str) -> bool:
        return await data_service.delete_goal(goal_id)


# Singleton
goal_planner = GoalPlanner()
