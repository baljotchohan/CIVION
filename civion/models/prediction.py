from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List

class Prediction(BaseModel):
    id: str
    event: str  # What will happen
    description: str
    confidence: float  # 0-1
    predicted_date: datetime
    supporting_factors: List[str] = Field(default_factory=list)
    risk_factors: List[str] = Field(default_factory=list)
    actual_date: Optional[datetime] = None
    accuracy: Optional[bool] = None
    created_at: datetime = Field(default_factory=datetime.now)
