"""Data models and validation logic for the edge API."""
from dataclasses import dataclass
from pydantic import BaseModel, Field

@dataclass
class Pod:
    """Represents a simulated Kubernetes Pod."""
    name: str
    namespace: str
    status: str
    role: str

class CpuSim(BaseModel):
    """Pydantic model for validating incoming simulated CPU loads."""
    load: float = Field(default=0.2, ge=0.0, le=1.0, description="CPU load constraint 0.0 - 1.0")
