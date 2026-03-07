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

    async def execute_goal(self, goal_id: str) -> Dict:
        """Execute a decomposed goal by running agent tasks."""
        goal = await data_service.get_goal(goal_id)
        if not goal:
            return {"error": "Goal not found"}

        goal["state"] = GoalState.EXECUTING.value
        goal["updated_at"] = now_iso()
        await data_service.save_goal(goal)

        # Import agents dynamically
        from civion.agents.github_trend_agent import github_trend_agent
        from civion.agents.research_monitor_agent import research_monitor_agent
        from civion.agents.market_signal_agent import market_signal_agent
        from civion.agents.sentiment_agent import sentiment_agent

        agent_map = {
            "github_trend": github_trend_agent,
            "research_monitor": research_monitor_agent,
            "market_signal": market_signal_agent,
            "sentiment": sentiment_agent,
        }

        results = []
        tasks = goal.get("tasks", [])
        for i, task in enumerate(tasks):
            agent_name = task.get("agent", "github_trend")
            agent = agent_map.get(agent_name)

            if agent:
                task["status"] = "running"
                result = await agent.run_cycle()
                task["status"] = "completed"
                task["result"] = {
                    "insights": len(result.insights),
                    "signals": len(result.signals),
                    "duration": result.duration_seconds,
                }
                results.append(result)
            else:
                task["status"] = "skipped"

            goal["progress"] = (i + 1) / len(tasks)
            await data_service.save_goal(goal)

        goal["state"] = GoalState.COMPLETED.value
        goal["updated_at"] = now_iso()
        await data_service.save_goal(goal)

        log.info(f"Goal execution complete: {goal['title']}")
        return goal

    async def get_goal(self, goal_id: str) -> Optional[Dict]:
        return await data_service.get_goal(goal_id)

    async def list_goals(self) -> List[Dict]:
        return await data_service.list_goals()

    async def delete_goal(self, goal_id: str) -> bool:
        return await data_service.delete_goal(goal_id)


# Singleton
goal_planner = GoalPlanner()
