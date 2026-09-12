import pytest
from httpx import AsyncClient
from unittest.mock import patch
from app.services.scope_validator import REFUSAL_MESSAGE

async def create_user_token(client: AsyncClient, name: str, email: str) -> str:
    res = await client.post("/api/auth/signup", json={
        "name": name,
        "email": email,
        "password": "Password123!",
        "confirm_password": "Password123!"
    })
    return res.json()["access_token"]

@pytest.mark.asyncio
async def test_send_out_of_scope_message(client: AsyncClient):
    token = await create_user_token(client, "Trader Bob", "bob_trader@example.com")
    conv_res = await client.post(
        "/api/conversations",
        headers={"Authorization": f"Bearer {token}"},
        json={}
    )
    conv_id = conv_res.json()["id"]

    # Send out of scope message (crypto)
    msg_res = await client.post(
        f"/api/conversations/{conv_id}/messages",
        headers={"Authorization": f"Bearer {token}"},
        json={"content": "Which crypto or Bitcoin should I buy right now?"}
    )
    assert msg_res.status_code == 200
    data = msg_res.json()
    assert data["is_out_of_scope"] is True
    assert data["assistant_message"]["content"] == REFUSAL_MESSAGE

@pytest.mark.asyncio
async def test_send_in_scope_message_with_title_generation(client: AsyncClient):
    token = await create_user_token(client, "Saver Sam", "sam_saver@example.com")
    conv_res = await client.post(
        "/api/conversations",
        headers={"Authorization": f"Bearer {token}"},
        json={"title": "New Conversation"}
    )
    conv_id = conv_res.json()["id"]

    # Mock Ollama response
    mock_ollama_reply = {
        "success": True,
        "model": "llama3.2",
        "content": "The 50/30/20 budgeting framework allocates 50% to needs, 30% to wants, and 20% to savings.",
        "error": None
    }

    with patch("app.services.ollama_service.OllamaService.generate_response", return_value=mock_ollama_reply):
        msg_res = await client.post(
            f"/api/conversations/{conv_id}/messages",
            headers={"Authorization": f"Bearer {token}"},
            json={"content": "Explain the 50/30/20 budgeting rule"}
        )
        assert msg_res.status_code == 200
        data = msg_res.json()
        assert data["is_out_of_scope"] is False
        assert "50/30/20" in data["assistant_message"]["content"]

        # Check that title was automatically updated without default "New Conversation"
        conv_check = await client.get(
            f"/api/conversations/{conv_id}",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert "50/30/20" in conv_check.json()["title"]

@pytest.mark.asyncio
async def test_message_history_retrieval(client: AsyncClient):
    token = await create_user_token(client, "History User", "history@example.com")
    conv_res = await client.post(
        "/api/conversations",
        headers={"Authorization": f"Bearer {token}"},
        json={}
    )
    conv_id = conv_res.json()["id"]

    await client.post(
        f"/api/conversations/{conv_id}/messages",
        headers={"Authorization": f"Bearer {token}"},
        json={"content": "How do I buy Bitcoin?"}  # Out of scope
    )

    get_msgs = await client.get(
        f"/api/conversations/{conv_id}/messages",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert get_msgs.status_code == 200
    msgs = get_msgs.json()
    assert len(msgs) == 2
    assert msgs[0]["role"] == "user"
    assert msgs[1]["role"] == "assistant"
    assert msgs[1]["content"] == REFUSAL_MESSAGE
