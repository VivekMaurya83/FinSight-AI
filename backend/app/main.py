import logging
from contextlib import asynccontextmanager
from typing import Optional
from fastapi import FastAPI, Request, status, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import engine, get_db
from app.api.deps import get_current_user
from app.models import Base, User
from app.services.ai_gateway import AIGateway
from app.api.endpoints import auth_router, conversations_router, messages_router, health_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("finsight")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Verify Database connection and ensure all tables exist
    logger.info(f"Starting {settings.PROJECT_NAME} v{settings.VERSION}...")
    try:
        async with engine.begin() as conn:
            await conn.execute(text("SELECT 1"))
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database connection confirmed and tables initialized successfully.")
    except Exception as e:
        logger.error(f"Failed to connect or initialize database at startup: {e}")

    yield

    # Shutdown: Cleanly dispose DB engine pool
    logger.info("Shutting down and disposing database connection pool...")
    await engine.dispose()
    logger.info("Database pool closed cleanly.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="FinSight AI: Focused Financial Education Chatbot & Aegis AI Testing Platform",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global safe exception handler - Never expose backend stack traces to clients
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled server error on {request.method} {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred. Please try again later."}
    )

# Register API Routers
app.include_router(auth_router, prefix=settings.API_PREFIX)
app.include_router(conversations_router, prefix=settings.API_PREFIX)
app.include_router(messages_router, prefix=settings.API_PREFIX)
app.include_router(health_router, prefix=settings.API_PREFIX)

@app.get("/", tags=["Root"])
async def root():
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "description": "Financial Education Assistant for Personal Budgeting, Savings, Investing, Loans, Credit Scores, and Terminology",
        "docs_url": "/docs"
    }

# ==============================================================================
# Keep-Alive & Anti-Inactivity Health Route (GET and HEAD compatible)
# Use with uptime monitors (e.g. UptimeRobot, cron-job) to keep cloud container awake
# ==============================================================================
@app.api_route("/health", methods=["GET", "HEAD"], tags=["Health"])
@app.api_route("/api/ping", methods=["GET", "HEAD"], tags=["Health"])
async def keep_alive_health():
    """Ultra-fast keep-alive endpoint for uptime pingers to prevent container sleep."""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "guardrail_mode": settings.GUARDRAIL_MODE,
        "llm_provider": settings.LLM_PROVIDER
    }

# ==============================================================================
# Guardrail Defense Toggle Endpoints (Authenticated via JWT Bearer Token)
# ==============================================================================
class DefenseToggleRequest(BaseModel):
    mode: str  # "basic" or "hardened"

@app.post("/api/defense/toggle", tags=["Defense & Security"])
async def toggle_defense_mode(
    payload: DefenseToggleRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Switches active guardrail mode server-wide.
    'basic' exposes vulnerabilities for Aegis AI demonstration.
    'hardened' enforces zero-trust prompt fencing for remediation demonstration.
    """
    if payload.mode not in ["basic", "hardened"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid mode. Allowed modes are 'basic' and 'hardened'."
        )
    settings.GUARDRAIL_MODE = payload.mode
    logger.info(f"Guardrail mode changed to '{payload.mode}' by user {current_user.email}")
    return {
        "status": "success",
        "active_guardrail_mode": settings.GUARDRAIL_MODE,
        "updated_by": current_user.email
    }

@app.get("/api/defense/mode", tags=["Defense & Security"])
async def get_defense_mode(
    current_user: User = Depends(get_current_user)
):
    """Returns the currently active guardrail mode."""
    return {
        "active_guardrail_mode": settings.GUARDRAIL_MODE,
        "llm_provider": settings.LLM_PROVIDER
    }

# ==============================================================================
# Aegis AI Red-Teaming Chat Target Endpoint (Authenticated)
# ==============================================================================
class SimpleChatPayload(BaseModel):
    message: Optional[str] = None
    content: Optional[str] = None

@app.post("/chat", tags=["Aegis AI Testing"])
@app.post("/api/chat", tags=["Aegis AI Testing"])
async def aegis_chat_endpoint(
    payload: SimpleChatPayload,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = payload.message or payload.content or "Hello"
    gateway = AIGateway(db=db)
    result = await gateway.process_chat(
        user_message=query,
        conversation_history=[],
        user_id=current_user.id
    )
    return {
        "reply": result.get("content", ""),
        "response": result.get("content", ""),
        "status": "success",
        "is_out_of_scope": result.get("is_out_of_scope", False),
        "guardrail_mode": settings.GUARDRAIL_MODE
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
