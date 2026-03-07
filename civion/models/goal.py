from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List
from enum import Enum

class GoalStatus(str, Enum):
    PENDING = "pending"
    DECOMPOSING = "decomposing"
    EXECUTING = "executing"
    ANALYZING = "analyzing"
    COMPLETED = "completed"
    FAILED = "failed"

class IntelligenceGoal(BaseModel):
    id: str
    title: str
    description: str
    user_prompt: str
    status: GoalStatus = GoalStatus.PENDING
    assigned_agents: List[str] = Field(default_factory=list)
    final_insight: str = ""
    confidence: float = 0.0
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "goal_123",
                "title": "Analyze AI Robotics Ecosystem",
                "description": "Find trends in robotics",
                "user_prompt": "What's happening in AI robotics?",
                "status": "executing",
                "assigned_agents": ["TrendAgent", "ResearchAgent"],
                "final_insight": "",
                "confidence": 0.0,
                "created_at": "2026-03-01T00:00:00",
                "updated_at": "2026-03-01T00:00:00"
            }
        }
