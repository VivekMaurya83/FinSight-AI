import abc
import time
from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.ollama_service import ollama_service, OllamaService
from app.services.ai_observability import AIObservability
from app.services.scope_validator import ScopeValidator, REFUSAL_MESSAGE

class AIProvider(abc.ABC):
    """Abstract Base Class for AI Model Providers."""

    @abc.abstractmethod
    async def generate_response(
        self,
        messages: List[Dict[str, str]],
        override_model: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate response from the underlying model provider."""
        pass

    @abc.abstractmethod
    async def get_active_model(self) -> str:
        """Returns the active model name."""
        pass


class OllamaProvider(AIProvider):
    """Concrete implementation for Ollama local inference."""

    def __init__(self, service: OllamaService = ollama_service):
        self.service = service

    async def generate_response(
        self,
        messages: List[Dict[str, str]],
        override_model: Optional[str] = None
    ) -> Dict[str, Any]:
        return await self.service.generate_response(messages, override_model=override_model)

    async def get_active_model(self) -> str:
        return await self.service.resolve_active_model()


# ==============================================================================
# Future Aegis AI Integration Placeholder (Extension Hook)
# ==============================================================================
# class AegisProvider(AIProvider):
#     """
#     Hook for future Aegis AI Trust & Safety Red-Teaming Gateway.
#     When ready, implement connection to Aegis AI proxy endpoint here.
#     """
#     async def generate_response(self, messages, override_model=None):
#         raise NotImplementedError("AegisProvider will be connected in testing Phase 2")
#
#     async def get_active_model(self):
#         return "aegis-shield-v1"


class AIGateway:
    """
    Central AI Gateway for FinSight AI.
    Handles provider abstraction, strict scope filtering, and observability logging.
    """

    def __init__(self, db: AsyncSession, provider: Optional[AIProvider] = None):
        self.db = db
        self.provider = provider or OllamaProvider()
        self.observability = AIObservability(db)

    async def process_chat(
        self,
        user_message: str,
        conversation_history: List[Dict[str, str]],
        user_id: Optional[str] = None,
        conversation_id: Optional[str] = None,
        override_model: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Executes the full FinSight AI pipeline:
        1. Generates unique request ID
        2. Performs deterministic & semantic scope validation
        3. If out-of-scope: immediately returns standard refusal and logs interaction
        4. If in-scope: sends context to AI Provider, measures latency, logs telemetry, returns response
        """
        request_id = self.observability.generate_request_id()
        start_time = time.perf_counter()

        # Step 1: Strict Scope Validation
        is_in_scope, refusal_reason = ScopeValidator.validate_query(user_message)
        if not is_in_scope:
            latency_ms = (time.perf_counter() - start_time) * 1000.0
            active_model = await self.provider.get_active_model()

            # Record out-of-scope interaction in observability table
            await self.observability.record_interaction(
                request_id=request_id,
                user_id=user_id,
                conversation_id=conversation_id,
                model=active_model,
                input_text=user_message,
                output_text=REFUSAL_MESSAGE,
                latency_ms=latency_ms,
                status="out_of_scope",
                error_message="Query matched out-of-scope financial domain filter"
            )

            return {
                "request_id": request_id,
                "content": REFUSAL_MESSAGE,
                "model": active_model,
                "latency_ms": latency_ms,
                "is_out_of_scope": True,
                "status": "out_of_scope"
            }

        # Step 2: In-scope generation via AI Provider
        chat_context = conversation_history + [{"role": "user", "content": user_message}]
        result = await self.provider.generate_response(chat_context, override_model=override_model)
        latency_ms = (time.perf_counter() - start_time) * 1000.0

        status = "success" if result["success"] else "error"
        error_msg = result.get("error")
        content = result.get("content", "")
        model_name = result.get("model", "unknown")

        # Step 3: Record full telemetry into observability table
        await self.observability.record_interaction(
            request_id=request_id,
            user_id=user_id,
            conversation_id=conversation_id,
            model=model_name,
            input_text=user_message,
            output_text=content,
            latency_ms=latency_ms,
            status=status,
            error_message=error_msg
        )

        return {
            "request_id": request_id,
            "content": content,
            "model": model_name,
            "latency_ms": latency_ms,
            "is_out_of_scope": False,
            "status": status,
            "error": error_msg
        }
