import pytest
from httpx import AsyncClient
from unittest.mock import patch
from app.services.ollama_service import OllamaService

@pytest.mark.asyncio
async def test_health_endpoints(client: AsyncClient):
    res = await client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert "status" in data
    assert "database" in data
    assert "ollama" in data

    db_res = await client.get("/api/health/database")
    assert db_res.status_code == 200
    assert db_res.json()["status"] == "online"

    ollama_res = await client.get("/api/health/ollama")
    assert ollama_res.status_code == 200
    assert "status" in ollama_res.json()

@pytest.mark.asyncio
async def test_ollama_service_resilience_when_offline():
    # Service configured with unreachable port
    service = OllamaService(base_url="http://127.0.0.1:59999")
    
    # Should not raise exception
    health = await service.health_check()
    assert health["status"] in ["offline", "error"]

    reply = await service.generate_response([{"role": "user", "content": "Hello"}])
    assert reply["success"] is False
    assert "Unable to connect to Ollama" in reply["content"]
