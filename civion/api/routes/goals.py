"""Goal API routes."""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from civion.engine.goal_planner import goal_planner

router = APIRouter(prefix="/goals", tags=["Goals"])


class GoalCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    description: str = Field("", max_length=2000)
    priority: int = 5


@router.post("")
async def create_goal(goal: GoalCreate):
    """Create a new intelligence goal with validation."""
    return await goal_planner.create_goal(goal.title, goal.description, goal.priority)


@router.get("")
async def list_goals():
    """List all goals."""
    return await goal_planner.list_goals()


@router.get("/{goal_id}")
async def get_goal(goal_id: str):
    """Get goal details."""
    goal = await goal_planner.get_goal(goal_id)
    if not goal:
        raise HTTPException(404, "Goal not found")
    return goal


@router.post("/{goal_id}/decompose")
async def decompose_goal(goal_id: str):
    """Decompose a goal into executable tasks."""
    return await goal_planner.decompose(goal_id)


@router.post("/{goal_id}/execute")
async def execute_goal(goal_id: str):
    """Execute a decomposed goal."""
    return await goal_planner.execute_goal(goal_id)


@router.get("/{goal_id}/progress")
async def goal_progress(goal_id: str):
    """Get goal execution progress."""
    goal = await goal_planner.get_goal(goal_id)
    if not goal:
        raise HTTPException(404, "Goal not found")
    return {"id": goal_id, "progress": goal.get("progress", 0), "state": goal.get("state")}


@router.delete("/{goal_id}")
async def delete_goal(goal_id: str):
    """Delete a goal."""
    deleted = await goal_planner.delete_goal(goal_id)
    if not deleted:
        raise HTTPException(404, "Goal not found")
    return {"deleted": True}
