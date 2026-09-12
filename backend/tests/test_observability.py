import pytest
from app.services.ai_observability import redact_sensitive_data, AIObservability
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.ai_interaction_repo import AIInteractionRepository

def test_sensitive_data_redaction():
    text_with_secrets = "My password: SuperSecret123 and token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9 and my card 4532-1234-5678-9012 with cvv: 789"
    redacted = redact_sensitive_data(text_with_secrets)

    assert "SuperSecret123" not in redacted
    assert "[REDACTED_PASSWORD]" in redacted
    assert "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" not in redacted
    assert "[REDACTED_TOKEN]" in redacted
    assert "4532-1234-5678-9012" not in redacted
    assert "[REDACTED_CARD_NUMBER]" in redacted
    assert "789" not in redacted
    assert "[REDACTED_SECRET]" in redacted

@pytest.mark.asyncio
async def test_interaction_recording(db_session: AsyncSession):
    obs = AIObservability(db_session)
    req_id = obs.generate_request_id()

    interaction = await obs.record_interaction(
        request_id=req_id,
        user_id="user_123",
        conversation_id="conv_456",
        model="llama3.2",
        input_text="How to calculate EMI?",
        output_text="EMI formula is P * r * (1+r)^n / ((1+r)^n - 1)",
        latency_ms=145.2,
        status="success"
    )

    assert interaction.id is not None
    assert interaction.request_id == req_id
    assert interaction.model == "llama3.2"
    assert interaction.latency_ms == 145.2

    # Query from DB to ensure persisted
    repo = AIInteractionRepository(db_session)
    retrieved = await repo.get_by_request_id(req_id)
    assert retrieved is not None
    assert retrieved.input_text == "How to calculate EMI?"
