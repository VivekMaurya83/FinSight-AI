from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from app.core.config import settings

from urllib.parse import urlparse, parse_qs, urlencode, urlunparse

def sanitize_asyncpg_url(database_url: str):
    """
    Sanitizes database URL for asyncpg:
    1. Strips unsupported query parameters (sslmode, channel_binding, etc.) that cause TypeError in asyncpg.connect.
    2. Maps SSL requirements into connect_args['ssl'] = 'require'.
    """
    if not database_url or database_url.startswith("sqlite"):
        return database_url, {"check_same_thread": False}, False

    parsed = urlparse(database_url)
    query_params = parse_qs(parsed.query)

    needs_ssl = any(k in database_url.lower() for k in [
        "neon.tech", "supabase.co", "render.com", "cockroach", "pooler",
        "sslmode=require", "ssl=require", "ssl=true", "sslmode=prefer"
    ])

    for param in ["sslmode", "channel_binding", "ssl"]:
        query_params.pop(param, None)

    new_query = urlencode(query_params, doseq=True)
    clean_url = urlunparse((
        parsed.scheme,
        parsed.netloc,
        parsed.path,
        parsed.params,
        new_query,
        parsed.fragment
    ))

    connect_args = {}
    if needs_ssl:
        connect_args["ssl"] = "require"

    return clean_url, connect_args, True

clean_db_url, connect_args, is_postgres = sanitize_asyncpg_url(settings.DATABASE_URL)
engine_kwargs = {"echo": False, "pool_pre_ping": True}

if is_postgres:
    engine_kwargs["pool_size"] = 10
    engine_kwargs["max_overflow"] = 20

engine = create_async_engine(
    clean_db_url,
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
