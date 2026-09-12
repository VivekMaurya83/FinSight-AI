from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict
from app.schemas.message import MessageResponse

class ConversationCreate(BaseModel):
    title: Optional[str] = Field(default="New Conversation", max_length=200)

class ConversationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    title: str
    created_at: datetime
    updated_at: datetime
    message_count: Optional[int] = 0

class ConversationDetailResponse(ConversationResponse):
    messages: List[MessageResponse] = []
