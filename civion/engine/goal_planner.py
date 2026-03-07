"""
CIVION — Intelligence Goal Planner System
Handles decomposing high-level user goals into agent tasks via LLM,
coordinating execution, and merging the final insights.
"""

from __future__ import annotations

import asyncio
import json
import logging
import uuid
from typing import Any

from pydantic import BaseModel, Field

from civion.services.llm_service import llm
from civion.storage.database import (
    save_goal,
    update_goal,
    save_task,
    update_task,
    get_all_goals,
    _fetch_all,
)
from civion.engine.agent_engine import engine

logger = logging.getLogger("civion.goal_planner")

class TaskDef(BaseModel):
    agent_name: str
    description: str
    parameters: dict[str, Any] = Field(default_factory=dict)

class GoalPlanner:
    async def create_goal(self, title: str, description: str, user_prompt: str) -> str:
        """Create a new intelligence goal and store it in pending state."""
        goal_id = f"goal_{uuid.uuid4().hex[:8]}"
        await save_goal(id=goal_id, title=title, description=description, user_prompt=user_prompt)
        logger.info(f"Created Goal {goal_id}: {title}")
        return goal_id

    async def decompose_goal(self, goal_id: str) -> list[str]:
        """Use LLM to break down a goal into tasks for specific agents."""
        goals = await _fetch_all("SELECT * FROM goals WHERE id = ?", (goal_id,))
        if not goals:
            raise ValueError(f"Goal {goal_id} not found")
        goal = goals[0]
        
        await update_goal(goal_id, status="decomposing")
        
        # Get available agents to inform the LLM
        agents = engine.list_agents()
        agent_names = [a["name"] for a in agents]
        agent_desc = "\n".join([f"- {a['name']} ({a.get('personality', 'Agent')}): {a.get('description', '')}" for a in agents])
        
        system_prompt = (
            "You are the CIVION Goal Orchestrator. Your job is to break down a high-level "
            "intelligence goal into concrete tasks assigned to available agents.\n"
            f"Available Agents:\n{agent_desc}\n\n"
            "Return ONLY a JSON array of task objects. Do not include markdown blocks or other text. Example:\n"
            '[{"agent_name": "TrendAgent", "description": "Scan GitHub based on query.", "parameters": {"query": "robotics"}}]'
        )
        
        user_msg = f"Goal Title: {goal['title']}\nDescription: {goal['description']}\nUser Prompt: {goal['user_prompt']}\nDecompose this."
        
        response = await llm.generate(prompt=user_msg, system=system_prompt)
        
        try:
            # Clean possible markdown from response
            text = response.strip()
            if text.startswith("```json"): text = text[7:]
            if text.startswith("```"): text = text[3:]
            if text.endswith("```"): text = text[:-3]
            
            tasks_data = json.loads(text.strip())
            
            assigned_agents = list(set([t.get("agent_name") for t in tasks_data if t.get("agent_name") in agent_names]))
            await update_goal(goal_id, assigned_agents=assigned_agents)
            
            created_tasks = []
            for t in tasks_data:
                agent_name = t.get("agent_name")
                if agent_name not in agent_names:
                    logger.warning(f"LLM suggested unknown agent {agent_name}. Skipping.")
                    continue
                
                task_id = f"task_{uuid.uuid4().hex[:8]}"
                await save_task(
                    id=task_id,
                    goal_id=goal_id,
                    agent_name=agent_name,
                    description=t.get("description", ""),
                    parameters=t.get("parameters", {})
                )
                created_tasks.append(task_id)
                
            await update_goal(goal_id, status="ready")
            return created_tasks
            
        except Exception as e:
            logger.error(f"Failed to decompose goal {goal_id}: {e}\nLLM output: {response}")
            await update_goal(goal_id, status="failed")
            return []

    async def execute_goal(self, goal_id: str) -> None:
        """Execute all tasks for a goal in parallel."""
        await update_goal(goal_id, status="executing")
        tasks = await _fetch_all("SELECT * FROM tasks WHERE goal_id = ?", (goal_id,))
        
        if not tasks:
            await update_goal(goal_id, status="failed", final_insight="No tasks to execute.")
            return

        # Execute tasks concurrently
        async def run_task(task: dict[str, Any]):
            task_id = task["id"]
            agent_name = task["agent_name"]
            await update_task(task_id, status="running")
            
            logger.info(f"Goal {goal_id} -> Executing {agent_name} for Task {task_id}")
            result = await engine.run_agent(agent_name)
            
            status = "completed" if result and result.success else "failed"
            res_content = result.content if result else "Agent failed to return result."
            await update_task(task_id, status=status, result=res_content)
        
        # Wait for all tasks
        coroutines = [run_task(t) for t in tasks]
        await asyncio.gather(*coroutines)
        
        # Tasks are done, now merge
        await update_goal(goal_id, status="analyzing")
        await self.merge_insights(goal_id)

    async def merge_insights(self, goal_id: str) -> None:
        """Summarize all task results into a final actionable insight."""
        goals = await _fetch_all("SELECT * FROM goals WHERE id = ?", (goal_id,))
        if not goals: return
        goal = goals[0]
        
        tasks = await _fetch_all("SELECT * FROM tasks WHERE goal_id = ?", (goal_id,))
        
        if not tasks:
            return
            
        results_text = ""
        for t in tasks:
            results_text += f"\n--- {t['agent_name']} ---\n{t['result']}\n"
            
        system_prompt = (
            "You are the CIVION Intelligence Synthesizer. You receive reports from multiple agents "
            "who executed parts of a user's intelligence goal. "
            "Compile their findings into a single, cohesive, highly professional final insight report. "
            "Highlight key findings, confidence levels, and actionable intelligence."
        )
        
        user_msg = (
            f"Original Goal: {goal['title']}\n"
            f"User Prompt: {goal['user_prompt']}\n\n"
            f"Agent Results:\n{results_text}"
        )
        
        final_insight = await llm.generate(prompt=user_msg, system=system_prompt)
        # simplistic confidence calculation
        success_tasks = len([t for t in tasks if t["status"] == "completed"])
        confidence = (success_tasks / len(tasks)) * 0.9 if tasks else 0.0
        
        await update_goal(goal_id, status="completed", final_insight=final_insight, confidence=confidence)
        logger.info(f"Goal {goal_id} completed successfully.")

planner_engine = GoalPlanner()
