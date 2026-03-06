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
from civion.storage.database import (
    save_goal, update_goal, save_subtask, update_subtask, get_all_goals
)

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
        self._goals_cache: dict[str, Goal] = {}

    async def create_goal(self, title: str, description: str) -> Goal:
        goal_id = f"goal_{int(datetime.now().timestamp())}"
        goal = Goal(id=goal_id, title=title, description=description)
        self._goals_cache[goal_id] = goal
        
        # Persist to DB
        await save_goal(goal_id, title, description)
        
        # Start planning in the background
        asyncio.create_task(self._process_goal(goal_id))
        
        return goal

    async def _process_goal(self, goal_id: str):
        goal = self._goals_cache.get(goal_id)
        if not goal: return

        try:
            goal.status = GoalStatus.PLANNING
            await update_goal(goal_id, goal.status)
            logger.info("Planning goal: %s", goal.title)

            # 1. Decompose goal into subtasks using LLM
            agents_info = engine.list_agents()
            agents_desc = "\n".join([f"- {a['name']}: {a['description']} (personality: {a['personality']})" for a in agents_info])
            
            prompt = f"""
            Decompose the following high-level intelligence goal into a sequence of actionable subtasks.
            Assign each task to the most suitable agent from the following list.
            You MUST use the EXACT NAMES provided below:
            {agents_desc}
            
            Goal: {goal.title}
            Description: {goal.description}
            
            IMPORTANT: Return ONLY a raw JSON list. Use exact agent names for "suggested_agent".
            Each object must have:
            "description": string (the specific task for the agent)
            "suggested_agent": string (the exact name of the agent)
            """
            
            response = await llm.generate(prompt, system="You are the CIVION Goal Planner. You decompose goals into agent-specific tasks.")
            
            # Clean up response
            response = response.strip()
            if response.startswith("```json"):
                response = response[7:-3].strip()
            elif response.startswith("```"):
                response = response[3:-3].strip()
                
            import json
            try:
                tasks_data = json.loads(response)
            except Exception as parse_error:
                logger.error("Failed to parse LLM goal decomposition: %s", parse_error)
                tasks_data = [{"description": f"Gather primary intelligence for: {goal.title}", "suggested_agent": "TrendAgent"}]

            for i, task_item in enumerate(tasks_data):
                subtask_id = f"{goal_id}_t{i}"
                subtask = SubTask(
                    id=subtask_id,
                    description=task_item.get('description', 'Task'),
                    assigned_agent=task_item.get('suggested_agent')
                )
                goal.subtasks.append(subtask)
                # Persist subtask to DB
                await save_subtask(subtask_id, goal_id, subtask.description, subtask.assigned_agent)

            goal.status = GoalStatus.IN_PROGRESS
            await update_goal(goal_id, goal.status)
            
            # 2. Execute subtasks sequentially
            results_context = []
            for subtask in goal.subtasks:
                if subtask.assigned_agent:
                    logger.info("Executing goal task: %s -> %s", subtask.assigned_agent, subtask.description)
                    subtask.status = GoalStatus.IN_PROGRESS
                    await update_subtask(subtask.id, subtask.status)
                    
                    result = await engine.run_agent(subtask.assigned_agent)
                    if result and result.success:
                        subtask.result = result.content
                        subtask.status = GoalStatus.COMPLETED
                        results_context.append(f"Agent {subtask.assigned_agent} findings: {result.content[:500]}")
                    else:
                        subtask.status = GoalStatus.FAILED
                        results_context.append(f"Agent {subtask.assigned_agent} failed to gather data.")

                    await update_subtask(subtask.id, subtask.status, subtask.result)
                    
                    # Broadcast subtask update
                    try:
                        from civion.api.server import manager
                        asyncio.create_task(manager.broadcast({
                            "type": "subtask_update",
                            "data": {"id": subtask.id, "goal_id": goal_id, "status": subtask.status, "result": subtask.result[:200]}
                        }))
                    except Exception: pass

            # 3. Generate final report / Merge outputs
            goal.status = GoalStatus.COMPLETED
            goal.completed_at = datetime.now()
            
            report_prompt = f"""
            Synthesize a final intelligence report for the goal: "{goal.title}"
            Based on the following agent findings:
            {" ".join(results_context)}
            
            Provide a professional, executive summary of the discovered patterns and insights.
            """
            
            goal.final_report = await llm.generate(report_prompt, system="You are the CIVION Intelligence Synthesizer.")
            await update_goal(goal_id, goal.status, goal.final_report)
            
            # Broadcast goal update
            try:
                from civion.api.server import manager
                asyncio.create_task(manager.broadcast({
                    "type": "goal_update",
                    "data": {"id": goal_id, "status": goal.status, "title": goal.title}
                }))
            except Exception: pass

            logger.info("Goal completed: %s", goal.title)

        except Exception as e:
            logger.error("Error processing goal %s: %s", goal_id, e)
            goal.status = GoalStatus.FAILED
            await update_goal(goal_id, goal.status)

    async def list_goals(self) -> List[dict[str, Any]]:
        return await get_all_goals()

planner_engine = PlannerEngine()
