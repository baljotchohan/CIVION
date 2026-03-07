from pydantic import BaseModel, Field
from datetime import datetime
from typing import List

class CascadeEvent(BaseModel):
    agent: str
    confidence: float
    timestamp: datetime = Field(default_factory=datetime.now)
    verified: bool = True

class ConfidenceUpdate(BaseModel):
    insight_id: str
    agent: str
    confidence: float
    cascade_events: List[CascadeEvent] = Field(default_factory=list)
    timestamp: datetime = Field(default_factory=datetime.now)
