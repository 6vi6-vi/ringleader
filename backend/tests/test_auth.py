import pytest
import uuid


@pytest.mark.asyncio
async def test_register(client):
    login = f"testuser_{uuid.uuid4().hex[:8]}"
    response = await client.post("/api/auth/register", json={
        "full_name": "Иванов Иван Иванович",
        "passport": "1234 567890",
        "login": login,
        "password": "password",
    })
    assert response.status_code == 201
    assert "access_token" in response.json()


@pytest.mark.asyncio
async def test_login_success(client):
    login = f"login_{uuid.uuid4().hex[:6]}"
    await client.post("/api/auth/register", json={
        "full_name": "Иванов Иван Иванович",
        "passport": "1234 567890",
        "login": login,
        "password": "password",
    })
    response = await client.post("/api/auth/login", json={
        "login": login,
        "password": "password",
    })
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_login_wrong_password(client):
    response = await client.post("/api/auth/login", json={
        "login": "nonexistent",
        "password": "wrong",
    })
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_guest_can_see_dogs(client):
    response = await client.get("/api/dogs")
    assert response.status_code == 200