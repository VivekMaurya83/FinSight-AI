from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from app.core.config import settings

# Engine configuration with connection pooling & Cloud SSL detection
is_sqlite = settings.DATABASE_URL.startswith("sqlite")
connect_args = {}
engine_kwargs = {"echo": False, "pool_pre_ping": True}

if is_sqlite:
    connect_args["check_same_thread"] = False
else:
    engine_kwargs["pool_size"] = 10
    engine_kwargs["max_overflow"] = 20
    db_url_lower = settings.DATABASE_URL.lower()
    if any(k in db_url_lower for k in ["neon.tech", "supabase.co", "render.com", "sslmode=require", "ssl=true", "cockroach"]):
        connect_args["ssl"] = True

engine = create_async_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    **engine_kwargs
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

Base = declarative_base()

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
