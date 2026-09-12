from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc
from app.models.ai_interaction import AIInteraction

class AIInteractionRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(
        self,
        request_id: str,
        user_id: Optional[str],
        conversation_id: Optional[str],
        model: str,
        input_text: str,
        output_text: str,
        latency_ms: float,
        status: str = "success",
        error_message: Optional[str] = None
    ) -> AIInteraction:
        interaction = AIInteraction(
            request_id=request_id,
            user_id=user_id,
            conversation_id=conversation_id,
            model=model,
            input_text=input_text,
            output_text=output_text,
            latency_ms=latency_ms,
            status=status,
            error_message=error_message
        )
        self.db.add(interaction)
        await self.db.commit()
        await self.db.refresh(interaction)
        return interaction

    async def get_by_request_id(self, request_id: str) -> Optional[AIInteraction]:
        stmt = select(AIInteraction).where(AIInteraction.request_id == request_id)
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def get_by_user(self, user_id: str, limit: int = 50) -> List[AIInteraction]:
        stmt = (
            select(AIInteraction)
            .where(AIInteraction.user_id == user_id)
            .order_by(desc(AIInteraction.created_at))
            .limit(limit)
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())
