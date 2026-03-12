import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from civion.engine.goal_planner import goal_planner

log = logging.getLogger(__name__)
router = APIRouter(prefix="/goals", tags=["Goals"])


class GoalCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    description: str = Field("", max_length=2000)
    priority: int = 5


@router.post("", response_model=Dict[str, Any])
async def create_goal(goal: GoalCreate) -> Dict[str, Any]:
    """Create a new intelligence goal with validation.
    
    Args:
        goal: Goal creation payload (title, description, priority).
        
    Returns:
        The created goal object dictionary.
        
    Raises:
        HTTPException: If goal creation fails.
    """
    try:
        return await goal_planner.create_goal(goal.title, goal.description, goal.priority)
    except Exception as e:
        log.error(f"Goal creation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create goal: {str(e)}")


@router.get("", response_model=List[Dict[str, Any]])
async def list_goals() -> List[Dict[str, Any]]:
    """List all goals currently in the system.
    
    Returns:
        A list of goal dictionaries.
        
    Raises:
        HTTPException: If goals cannot be retrieved.
    """
    try:
        return await goal_planner.list_goals()
    except Exception as e:
        log.error(f"Failed to list goals: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to list goals: {str(e)}")


@router.get("/{goal_id}", response_model=Dict[str, Any])
async def get_goal(goal_id: str) -> Dict[str, Any]:
    """Get detailed information for a specific goal.
    
    Args:
        goal_id: The unique identifier of the goal.
        
    Returns:
        The goal dictionary.
        
    Raises:
        HTTPException 404: If the goal is not found.
        HTTPException 500: On internal server error.
    """
    try:
        goal = await goal_planner.get_goal(goal_id)
        if not goal:
            raise HTTPException(status_code=404, detail="Goal not found")
        return goal
    except HTTPException:
        raise
    except Exception as e:
        log.error(f"Failed to get goal {goal_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/{goal_id}/execute", response_model=Dict[str, Any])
async def execute_goal(goal_id: str) -> Dict[str, Any]:
    """Execute a decomposed goal by starting its processing.
    
    Args:
        goal_id: The ID of the goal to execute.
        
    Returns:
        Status of the execution request.
        
    Raises:
        HTTPException: If execution initiation fails.
    """
    try:
        return await goal_planner.execute_goal(goal_id)
    except HTTPException:
        raise
    except Exception as e:
        log.error(f"Goal execution failed for {goal_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Execution failed: {str(e)}")


@router.get("/{goal_id}/progress", response_model=Dict[str, Any])
async def goal_progress(goal_id: str) -> Dict[str, Any]:
    """Get real-time execution progress of a goal.
    
    Args:
        goal_id: The ID of the goal.
        
    Returns:
        Dictionary containing ID, progress (0-100), and state.
        
    Raises:
        HTTPException 404: If the goal doesn't exist.
    """
    try:
        goal = await goal_planner.get_goal(goal_id)
        if not goal:
            raise HTTPException(status_code=404, detail="Goal not found")
        return {"id": goal_id, "progress": goal.get("progress", 0), "state": goal.get("state")}
    except HTTPException:
        raise
    except Exception as e:
        log.error(f"Failed to get progress for {goal_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.delete("/{goal_id}", response_model=Dict[str, Any])
async def delete_goal(goal_id: str) -> Dict[str, Any]:
    """Permanently delete a goal and its associated data.
    
    Args:
        goal_id: The unique ID to delete.
        
    Returns:
        Status of the deletion.
        
    Raises:
        HTTPException 404: If the goal is not found.
    """
    try:
        deleted = await goal_planner.delete_goal(goal_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Goal not found")
        return {"deleted": True}
    except HTTPException:
        raise
    except Exception as e:
        log.error(f"Goal deletion failed for {goal_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Deletion failed: {str(e)}")
