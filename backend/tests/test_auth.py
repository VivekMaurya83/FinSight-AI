import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_signup_success(client: AsyncClient):
    payload = {
        "name": "Jane Doe",
        "email": "jane@example.com",
        "password": "Password123!",
        "confirm_password": "Password123!"
    }
    response = await client.post("/api/auth/signup", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "jane@example.com"
    assert data["user"]["name"] == "Jane Doe"
    assert "password" not in data["user"]
    assert "password_hash" not in data["user"]

@pytest.mark.asyncio
async def test_signup_password_mismatch(client: AsyncClient):
    payload = {
        "name": "Jane Doe",
        "email": "jane_mismatch@example.com",
        "password": "Password123!",
        "confirm_password": "WrongPassword!"
    }
    response = await client.post("/api/auth/signup", json=payload)
    assert response.status_code == 422

@pytest.mark.asyncio
async def test_signup_duplicate_email(client: AsyncClient):
    payload = {
        "name": "Jane Doe",
        "email": "duplicate@example.com",
        "password": "Password123!",
        "confirm_password": "Password123!"
    }
    res1 = await client.post("/api/auth/signup", json=payload)
    assert res1.status_code == 201

    res2 = await client.post("/api/auth/signup", json=payload)
    assert res2.status_code == 400
    assert "already exists" in res2.json()["detail"]

@pytest.mark.asyncio
async def test_login_success(client: AsyncClient):
    signup_payload = {
        "name": "Bob Smith",
        "email": "bob@example.com",
        "password": "SecretPassword123",
        "confirm_password": "SecretPassword123"
    }
    await client.post("/api/auth/signup", json=signup_payload)

    login_payload = {
        "email": "bob@example.com",
        "password": "SecretPassword123"
    }
    response = await client.post("/api/auth/login", json=login_payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "bob@example.com"

@pytest.mark.asyncio
async def test_login_invalid_password(client: AsyncClient):
    signup_payload = {
        "name": "Bob Smith",
        "email": "bob2@example.com",
        "password": "SecretPassword123",
        "confirm_password": "SecretPassword123"
    }
    await client.post("/api/auth/signup", json=signup_payload)

    login_payload = {
        "email": "bob2@example.com",
        "password": "WrongPassword"
    }
    response = await client.post("/api/auth/login", json=login_payload)
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_protected_me_endpoint(client: AsyncClient):
    # Unauthenticated should fail
    unauth = await client.get("/api/auth/me")
    assert unauth.status_code == 401

    # Signup to get token
    signup_payload = {
        "name": "Alice User",
        "email": "alice@example.com",
        "password": "SecurePassword456",
        "confirm_password": "SecurePassword456"
    }
    signup_res = await client.post("/api/auth/signup", json=signup_payload)
    token = signup_res.json()["access_token"]

    # Authenticated request
    auth_res = await client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert auth_res.status_code == 200
    assert auth_res.json()["email"] == "alice@example.com"
