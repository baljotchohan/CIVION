from pydantic import BaseModel, Field
from datetime import datetime

class Persona(BaseModel):
    id: str
    name: str
    description: str
    system_prompt: str  # How to think
    reasoning_style: str  # e.g., "analytical", "creative", "critical"
    created_by: str
    created_at: datetime = Field(default_factory=datetime.now)
    usage_count: int = 0
    shared: bool = False  # Can share with community
