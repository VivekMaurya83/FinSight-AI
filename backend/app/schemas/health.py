from typing import Optional, Dict, Any
from pydantic import BaseModel

class HealthStatus(BaseModel):
    status: str
    version: str
    database: Dict[str, Any]
    ollama: Dict[str, Any]

class DatabaseHealth(BaseModel):
    status: str
    message: Optional[str] = None

class OllamaHealth(BaseModel):
    status: str
    base_url: str
    configured_model: str
    active_model: Optional[str] = None
    available_models: list[str] = []
    message: Optional[str] = None
