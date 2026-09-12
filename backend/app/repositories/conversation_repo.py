from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc, func
from sqlalchemy.orm import selectinload
from app.models.conversation import Conversation
from app.models.message import Message

class ConversationRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, conversation_id: str, load_messages: bool = False) -> Optional[Conversation]:
        stmt = select(Conversation).where(Conversation.id == conversation_id)
        if load_messages:
            stmt = stmt.options(selectinload(Conversation.messages))
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def get_user_conversations(self, user_id: str, limit: int = 50, offset: int = 0) -> List[Conversation]:
        stmt = (
            select(Conversation)
            .where(Conversation.user_id == user_id)
            .order_by(desc(Conversation.updated_at))
            .offset(offset)
            .limit(limit)
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def count_user_conversations(self, user_id: str) -> int:
        stmt = select(func.count(Conversation.id)).where(Conversation.user_id == user_id)
        result = await self.db.execute(stmt)
        return result.scalar() or 0

    async def create(self, user_id: str, title: str = "New Conversation") -> Conversation:
        conversation = Conversation(
            user_id=user_id,
            title=title
        )
        self.db.add(conversation)
        await self.db.commit()
        await self.db.refresh(conversation)
        return conversation

    async def update_title(self, conversation_id: str, title: str) -> Optional[Conversation]:
        conv = await self.get_by_id(conversation_id)
        if conv:
            conv.title = title
            await self.db.commit()
            await self.db.refresh(conv)
        return conv

    async def delete(self, conversation_id: str) -> bool:
        conv = await self.get_by_id(conversation_id)
        if conv:
            await self.db.delete(conv)
            await self.db.commit()
            return True
        return False
