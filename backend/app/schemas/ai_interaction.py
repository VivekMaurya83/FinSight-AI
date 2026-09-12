from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class AIInteractionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    request_id: str
    user_id: Optional[str] = None
    conversation_id: Optional[str] = None
    model: str
    input_text: str
    output_text: str
    latency_ms: float
    status: str
    error_message: Optional[str] = None
    created_at: datetime
