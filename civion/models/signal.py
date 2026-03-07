from pydantic import BaseModel, Field
from datetime import datetime
from typing import List

class IntelligenceSignal(BaseModel):
    id: str
    topic: str
    description: str
    confidence: float  # 0-1
    supporting_insights: List[str] = Field(default_factory=list)
    agents_involved: List[str] = Field(default_factory=list)
    evidence: str = ""
    created_at: datetime
    updated_at: datetime
