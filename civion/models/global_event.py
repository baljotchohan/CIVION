from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List

class GlobalEvent(BaseModel):
    id: str
    agent_name: str
    topic: str
    description: str
    latitude: float
    longitude: float
    location: str
    severity: str  # "info", "warning", "critical"
    signal_ids: List[str] = Field(default_factory=list)
    created_at: datetime
    
    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "agent": self.agent_name,
            "topic": self.topic,
            "description": self.description,
            "coordinates": [self.latitude, self.longitude],
            "location": self.location,
            "severity": self.severity,
            "timestamp": self.created_at.isoformat()
        }
