from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import asc, func
from app.models.message import Message

class MessageRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_conversation(self, conversation_id: str) -> List[Message]:
        stmt = (
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .order_by(asc(Message.created_at))
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def count_by_conversation(self, conversation_id: str) -> int:
        stmt = select(func.count(Message.id)).where(Message.conversation_id == conversation_id)
        result = await self.db.execute(stmt)
        return result.scalar() or 0

    async def create(self, conversation_id: str, role: str, content: str) -> Message:
        message = Message(
            conversation_id=conversation_id,
            role=role,
            content=content
        )
        self.db.add(message)
        await self.db.commit()
        await self.db.refresh(message)
        return message
