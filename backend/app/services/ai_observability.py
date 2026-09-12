import time
import uuid
import re
from typing import Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.ai_interaction_repo import AIInteractionRepository
from app.models.ai_interaction import AIInteraction

# Regex patterns for redacting sensitive secrets from observability logs
SENSITIVE_PATTERNS = [
    (r'(?i)(password|passwd|pwd)\s*[:=]\s*["\']?([^"\'\s,]+)["\']?', r'\1: [REDACTED_PASSWORD]'),
    (r'(?i)(bearer\s+)([A-Za-z0-9\-_\.=]+)', r'\1[REDACTED_TOKEN]'),
    (r'(?i)(jwt|token)\s*[:=]\s*["\']?([^"\'\s,]+)["\']?', r'\1: [REDACTED_TOKEN]'),
    (r'(?i)(otp|pin|cvv|cvc)\s*[:=]?\s*["\']?(\d{3,6})["\']?', r'\1: [REDACTED_SECRET]'),
    (r'\b(?:\d[ -]*?){13,16}\b', '[REDACTED_CARD_NUMBER]'),
]

def redact_sensitive_data(text: str) -> str:
    """Sanitize inputs and outputs before persisting to observability logs."""
    if not text:
        return text
    sanitized = text
    for pattern, replacement in SENSITIVE_PATTERNS:
        sanitized = re.sub(pattern, replacement, sanitized)
    return sanitized

class AIObservability:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = AIInteractionRepository(db)

    @staticmethod
    def generate_request_id() -> str:
        """Create a globally unique, high-entropy request identifier."""
        return f"req_{uuid.uuid4().hex}"

    async def record_interaction(
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
        """
        Records an interaction in the ai_interactions table with sanitized text.
        Designed specifically for Aegis AI test monitoring, red-teaming telemetry, and evaluation.
        """
        clean_input = redact_sensitive_data(input_text)
        clean_output = redact_sensitive_data(output_text)
        clean_error = redact_sensitive_data(error_message) if error_message else None

        return await self.repo.create(
            request_id=request_id,
            user_id=user_id,
            conversation_id=conversation_id,
            model=model,
            input_text=clean_input,
            output_text=clean_output,
            latency_ms=round(latency_ms, 2),
            status=status,
            error_message=clean_error
        )
