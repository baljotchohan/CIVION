"""
CIVION — Goal Planner Engine
Allows users to submit high-level goals which are then decomposed
into subtasks and assigned to specific agents.
"""

from __future__ import annotations

import logging
import asyncio
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Any, List, Optional

from civion.services.llm_service import llm
from civion.engine.agent_engine import engine

logger = logging.getLogger("civion.planner")

class GoalStatus(str, Enum):
    PENDING = "pending"
    PLANNING = "planning"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"

@dataclass
class SubTask:
    id: str
    description: str
    assigned_agent: Optional[str] = None
    status: GoalStatus = GoalStatus.PENDING
    result: Optional[str] = None

@dataclass
class Goal:
    id: str
    title: str
    description: str
    status: GoalStatus = GoalStatus.PENDING
    subtasks: List[SubTask] = field(default_factory=list)
    created_at: datetime = field(default_factory=datetime.now)
    completed_at: Optional[datetime] = None
    final_report: Optional[str] = None

class PlannerEngine:
    def __init__(self):
        self.goals: dict[str, Goal] = {}

    async def create_goal(self, title: str, description: str) -> Goal:
        goal_id = f"goal_{int(datetime.now().timestamp())}"
        goal = Goal(id=goal_id, title=title, description=description)
        self.goals[goal_id] = goal
        
        # Start planning in the background
        asyncio.create_task(self._process_goal(goal_id))
        
        return goal

    async def _process_goal(self, goal_id: str):
        goal = self.goals.get(goal_id)
        if not goal: return

        try:
            goal.status = GoalStatus.PLANNING
            logger.info("Planning goal: %s", goal.title)

            # 1. Decompose goal into subtasks using LLM
            agents_info = engine.list_agents()
            agents_list = ", ".join([a['name'] for a in agents_info])
            
            prompt = f"""
            Decompose the following goal into a list of specific subtasks that can be handled by these agents: {agents_list}.
            Goal: {goal.title}
            Description: {goal.description}
            
            Return a JSON list of tasks, each with 'description' and 'suggested_agent'.
            """
            
            # This is a placeholder for actual LLM parsing logic
            # In a real implementation, we'd use structured output
            tasks_data = [
                {"description": f"Research {goal.title} basics", "suggested_agent": "ResearchRadar"},
                {"description": f"Check trending repos for {goal.title}", "suggested_agent": "TrendAgent"}
            ]
            
            for i, task in enumerate(tasks_data):
                subtask = SubTask(
                    id=f"{goal_id}_t{i}",
                    description=task['description'],
                    assigned_agent=task['suggested_agent']
                )
                goal.subtasks.append(subtask)

            goal.status = GoalStatus.IN_PROGRESS
            
            # 2. Execute subtasks
            for subtask in goal.subtasks:
                if subtask.assigned_agent:
                    logger.info("Executing subtask: %s with agent %s", subtask.description, subtask.assigned_agent)
                    subtask.status = GoalStatus.IN_PROGRESS
                    result = await engine.run_agent(subtask.assigned_agent)
                    if result and result.success:
                        subtask.result = result.content
                        subtask.status = GoalStatus.COMPLETED
                    else:
                        subtask.status = GoalStatus.FAILED

            # 3. Generate final report
            goal.status = GoalStatus.COMPLETED
            goal.completed_at = datetime.now()
            goal.final_report = f"Analysis of {goal.title} complete. Data collected from {len(goal.subtasks)} sources."
            logger.info("Goal completed: %s", goal.title)

        except Exception as e:
            logger.error("Error processing goal %s: %s", goal_id, e)
            goal.status = GoalStatus.FAILED

    def list_goals(self) -> List[Goal]:
        return list(self.goals.values())

planner_engine = PlannerEngine()
