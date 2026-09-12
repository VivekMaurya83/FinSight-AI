import logging
from contextlib import asynccontextmanager
from typing import Optional
from fastapi import FastAPI, Request, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import engine, get_db
from app.api.deps import get_current_user
from app.models.user import User
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
    # Startup: Verify Database connection
    logger.info(f"Starting {settings.PROJECT_NAME} v{settings.VERSION}...")
    try:
        async with engine.begin() as conn:
            await conn.execute(text("SELECT 1"))
        logger.info("PostgreSQL database connection confirmed successfully.")
    except Exception as e:
        logger.error(f"Failed to connect to PostgreSQL at startup: {e}")

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
        "is_out_of_scope": result.get("is_out_of_scope", False)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
