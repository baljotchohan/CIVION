import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List
from civion.engine.goal_planner import goal_planner

log = logging.getLogger(__name__)
router = APIRouter(prefix="/goals", tags=["Goals"])


class GoalCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    description: str = Field("", max_length=2000)
    priority: int = 5


@router.post("")
async def create_goal(goal: GoalCreate):
    """Create a new intelligence goal with validation."""
    try:
        return await goal_planner.create_goal(goal.title, goal.description, goal.priority)
    except Exception as e:
        log.error(f"Goal creation failed: {e}")
        raise HTTPException(500, f"Failed to create goal: {str(e)}")


@router.get("")
async def list_goals():
    """List all goals."""
    try:
        return await goal_planner.list_goals()
    except Exception as e:
        log.error(f"Failed to list goals: {e}")
        raise HTTPException(500, f"Failed to list goals: {str(e)}")


@router.get("/{goal_id}")
async def get_goal(goal_id: str):
    """Get goal details."""
    try:
        goal = await goal_planner.get_goal(goal_id)
        if not goal:
            raise HTTPException(404, "Goal not found")
        return goal
    except HTTPException:
        raise
    except Exception as e:
        log.error(f"Failed to get goal {goal_id}: {e}")
        raise HTTPException(500, f"Internal server error: {str(e)}")


@router.post("/{goal_id}/execute")
async def execute_goal(goal_id: str):
    """Execute a decomposed goal."""
    try:
        return await goal_planner.execute_goal(goal_id)
    except HTTPException:
        raise
    except Exception as e:
        log.error(f"Goal execution failed for {goal_id}: {e}")
        raise HTTPException(500, f"Execution failed: {str(e)}")


@router.get("/{goal_id}/progress")
async def goal_progress(goal_id: str):
    """Get goal execution progress."""
    try:
        goal = await goal_planner.get_goal(goal_id)
        if not goal:
            raise HTTPException(404, "Goal not found")
        return {"id": goal_id, "progress": goal.get("progress", 0), "state": goal.get("state")}
    except HTTPException:
        raise
    except Exception as e:
        log.error(f"Failed to get progress for {goal_id}: {e}")
        raise HTTPException(500, f"Internal server error: {str(e)}")


@router.delete("/{goal_id}")
async def delete_goal(goal_id: str):
    """Delete a goal."""
    try:
        deleted = await goal_planner.delete_goal(goal_id)
        if not deleted:
            raise HTTPException(404, "Goal not found")
        return {"deleted": True}
    except HTTPException:
        raise
    except Exception as e:
        log.error(f"Goal deletion failed for {goal_id}: {e}")
        raise HTTPException(500, f"Deletion failed: {str(e)}")
