from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

class MessageCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=4000, description="Message content")

class MessageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    conversation_id: str
    role: str
    content: str
    created_at: datetime

class SendMessageResponse(BaseModel):
    user_message: MessageResponse
    assistant_message: MessageResponse
    is_out_of_scope: bool = False
    latency_ms: float = 0.0
