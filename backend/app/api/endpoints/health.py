from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.core.database import get_db
from app.core.config import settings
from app.services.ollama_service import ollama_service
from app.schemas.health import HealthStatus, DatabaseHealth, OllamaHealth

router = APIRouter(prefix="/health", tags=["Health"])

@router.get("", response_model=HealthStatus)
async def health_check(db: AsyncSession = Depends(get_db)):
    """Comprehensive health check for FinSight AI services."""
    db_health = {"status": "unknown"}
    try:
        await db.execute(text("SELECT 1"))
        db_health = {"status": "online", "message": "Database is operational"}
    except Exception as e:
        db_health = {"status": "offline", "message": str(e)}

    if settings.LLM_PROVIDER.lower() == "groq":
        keys = settings.get_all_groq_keys()
        ollama_info = {
            "status": "online" if len(keys) > 0 else "offline",
            "base_url": settings.GROQ_BASE_URL,
            "configured_model": settings.GROQ_MODEL,
            "active_model": "qwen3.8-27b",
            "available_models": [settings.GROQ_MODEL],
            "message": f"Groq Cloud active with {len(keys)} key(s)"
        }
    else:
        ollama_info = await ollama_service.health_check()

    overall = "healthy" if db_health["status"] == "online" and ollama_info["status"] == "online" else "degraded"
    if db_health["status"] != "online":
        overall = "unhealthy"

    return HealthStatus(
        status=overall,
        version=settings.VERSION,
        database=db_health,
        ollama=ollama_info
    )

@router.get("/database", response_model=DatabaseHealth)
async def database_health(db: AsyncSession = Depends(get_db)):
    """Check PostgreSQL database connection."""
    try:
        await db.execute(text("SELECT 1"))
        return DatabaseHealth(status="online", message="PostgreSQL is connected and queryable")
    except Exception as e:
        return DatabaseHealth(status="offline", message=str(e))

@router.get("/ollama", response_model=OllamaHealth)
@router.get("/model", response_model=OllamaHealth)
async def ollama_health():
    """Check active LLM service status and model availability."""
    if settings.LLM_PROVIDER.lower() == "groq":
        keys = settings.get_all_groq_keys()
        return OllamaHealth(
            status="online" if len(keys) > 0 else "offline",
            base_url=settings.GROQ_BASE_URL,
            configured_model=settings.GROQ_MODEL,
            active_model="qwen3.8-27b",
            available_models=[settings.GROQ_MODEL],
            message=f"Groq Cloud active with {len(keys)} key(s)"
        )

    info = await ollama_service.health_check()
    return OllamaHealth(
        status=info.get("status", "unknown"),
        base_url=info.get("base_url", settings.OLLAMA_BASE_URL),
        configured_model=info.get("configured_model", settings.OLLAMA_MODEL),
        active_model=info.get("active_model"),
        available_models=info.get("available_models", []),
        message=info.get("message")
    )
