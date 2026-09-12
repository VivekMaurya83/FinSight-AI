import re
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.rate_limiter import chat_rate_limiter
from app.api.deps import get_current_user
from app.models.user import User
from app.repositories.conversation_repo import ConversationRepository
from app.repositories.message_repo import MessageRepository
from app.services.ai_gateway import AIGateway
from app.schemas.message import MessageCreate, MessageResponse, SendMessageResponse

router = APIRouter(prefix="/conversations/{conversation_id}/messages", tags=["Messages"])

def generate_conversation_title(first_message: str) -> str:
    """
    Deterministically generates a clean, concise title from the user's first prompt
    without requiring an extra LLM call.
    """
    clean = re.sub(r'[\r\n\t]+', ' ', first_message).strip()
    clean = re.sub(r'^(can you please |can you |tell me about |what is |explain |how to |how does )', '', clean, flags=re.IGNORECASE).strip()
    if not clean:
        clean = "Financial Discussion"
    
    # Capitalize first letter
    clean = clean[0].upper() + clean[1:]
    
    # Truncate at word boundary up to 45 chars
    if len(clean) > 45:
        truncated = clean[:42]
        last_space = truncated.rfind(' ')
        if last_space > 20:
            clean = truncated[:last_space] + "..."
        else:
            clean = truncated + "..."
    return clean

@router.post("", response_model=SendMessageResponse)
async def send_message(
    conversation_id: str,
    payload: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Sends a message in a conversation.
    1. Enforces rate limits
    2. Enforces conversation ownership
    3. Auto-updates title on initial message
    4. Evaluates scope & queries AI Gateway
    5. Saves both user and assistant messages
    6. Logs AI observability telemetry
    """
    # 1. Rate Limiting Check
    chat_rate_limiter.check_rate_limit(current_user.id)

    # 2. Ownership & Conversation Validation
    conv_repo = ConversationRepository(db)
    msg_repo = MessageRepository(db)
    
    conv = await conv_repo.get_by_id(conversation_id)
    if not conv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    if conv.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this conversation"
        )

    # 3. Check existing message history
    existing_messages = await msg_repo.get_by_conversation(conversation_id)
    
    # Auto-generate title if this is the first message or title is default
    if len(existing_messages) == 0 or conv.title == "New Conversation":
        auto_title = generate_conversation_title(payload.content)
        await conv_repo.update_title(conversation_id, auto_title)

    # 4. Save User Message
    user_msg = await msg_repo.create(
        conversation_id=conversation_id,
        role="user",
        content=payload.content.strip()
    )

    # 5. Build context history for AI Gateway
    history = [{"role": m.role, "content": m.content} for m in existing_messages]

    # 6. Execute AI Gateway
    gateway = AIGateway(db)
    ai_result = await gateway.process_chat(
        user_message=payload.content.strip(),
        conversation_history=history,
        user_id=current_user.id,
        conversation_id=conversation_id
    )

    # 7. Save Assistant Message
    assistant_msg = await msg_repo.create(
        conversation_id=conversation_id,
        role="assistant",
        content=ai_result["content"]
    )

    return SendMessageResponse(
        user_message=MessageResponse.model_validate(user_msg),
        assistant_message=MessageResponse.model_validate(assistant_msg),
        is_out_of_scope=ai_result.get("is_out_of_scope", False),
        latency_ms=ai_result.get("latency_ms", 0.0)
    )

@router.get("", response_model=List[MessageResponse])
async def get_messages(
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieves all messages for a specific conversation."""
    conv_repo = ConversationRepository(db)
    msg_repo = MessageRepository(db)
    
    conv = await conv_repo.get_by_id(conversation_id)
    if not conv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    if conv.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this conversation"
        )

    messages = await msg_repo.get_by_conversation(conversation_id)
    return [MessageResponse.model_validate(m) for m in messages]
