import pytest
from httpx import AsyncClient

async def create_user_token(client: AsyncClient, name: str, email: str) -> str:
    res = await client.post("/api/auth/signup", json={
        "name": name,
        "email": email,
        "password": "Password123!",
        "confirm_password": "Password123!"
    })
    return res.json()["access_token"]

@pytest.mark.asyncio
async def test_conversation_lifecycle_and_ownership(client: AsyncClient):
    token_user_a = await create_user_token(client, "User A", "user_a@example.com")
    token_user_b = await create_user_token(client, "User B", "user_b@example.com")

    # User A creates a conversation
    create_res = await client.post(
        "/api/conversations",
        headers={"Authorization": f"Bearer {token_user_a}"},
        json={"title": "Budgeting Advice"}
    )
    assert create_res.status_code == 201
    conv_id = create_res.json()["id"]
    assert create_res.json()["title"] == "Budgeting Advice"

    # User A can retrieve it
    get_res = await client.get(
        f"/api/conversations/{conv_id}",
        headers={"Authorization": f"Bearer {token_user_a}"}
    )
    assert get_res.status_code == 200
    assert get_res.json()["id"] == conv_id

    # User B CANNOT access User A's conversation (403 Forbidden)
    forbidden_res = await client.get(
        f"/api/conversations/{conv_id}",
        headers={"Authorization": f"Bearer {token_user_b}"}
    )
    assert forbidden_res.status_code == 403

    # User B CANNOT delete User A's conversation
    del_forbidden = await client.delete(
        f"/api/conversations/{conv_id}",
        headers={"Authorization": f"Bearer {token_user_b}"}
    )
    assert del_forbidden.status_code == 403

    # User A deletes their conversation
    del_res = await client.delete(
        f"/api/conversations/{conv_id}",
        headers={"Authorization": f"Bearer {token_user_a}"}
    )
    assert del_res.status_code == 204

    # Now it is not found
    get_404 = await client.get(
        f"/api/conversations/{conv_id}",
        headers={"Authorization": f"Bearer {token_user_a}"}
    )
    assert get_404.status_code == 404
