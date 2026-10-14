import os
from typing import List, Union
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, field_validator

class Settings(BaseSettings):
    PROJECT_NAME: str = "FinSight AI"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/finsight"

    # JWT Authentication
    JWT_SECRET_KEY: str = "finsight_ai_super_secret_jwt_key_2026_aegis_testing_suite"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # LLM Provider Configuration
    LLM_PROVIDER: str = "groq"  # "groq" or "ollama"

    # Groq Cloud LLM (Fault-Tolerant Multi-Key Rotation)
    GROQ_API_KEYS: Union[List[str], str] = []
    GROQ_API_KEY: str = ""  # Backward-compatible single key
    GROQ_MODEL: str = "qwen/qwen3.8-27b"
    GROQ_BASE_URL: str = "https://api.groq.com/openai/v1"
    GROQ_TIMEOUT_SECONDS: float = 30.0

    # Ollama LLM (Local)
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3.2"
    OLLAMA_TIMEOUT_SECONDS: float = 60.0

    # Guardrail Hardening Mode ("basic" or "hardened")
    GUARDRAIL_MODE: str = "basic"

    # Rate Limiting
    CHAT_RATE_LIMIT: int = 60  # requests per minute per user

    # CORS
    FRONTEND_URL: str = "http://localhost:5173"
    CORS_ORIGINS: Union[List[str], str] = [
        "*",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

    @field_validator("GROQ_API_KEYS", mode="before")
    @classmethod
    def assemble_groq_keys(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            if v.startswith("[") and v.endswith("]"):
                import json
                try:
                    return json.loads(v)
                except Exception:
                    pass
            return [k.strip() for k in v.split(",") if k.strip()]
        elif isinstance(v, list):
            return [str(k).strip() for k in v if str(k).strip()]
        return []

    def get_all_groq_keys(self) -> List[str]:
        """Combines GROQ_API_KEYS and GROQ_API_KEY into a clean deduplicated list."""
        keys = list(self.GROQ_API_KEYS)
        if self.GROQ_API_KEY and self.GROQ_API_KEY.strip() not in keys:
            keys.insert(0, self.GROQ_API_KEY.strip())
        return keys

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        return ["*"]

settings = Settings()
