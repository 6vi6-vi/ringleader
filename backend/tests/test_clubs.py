import pytest
import uuid


@pytest.mark.asyncio
async def test_get_empty_clubs(client):
    resp = await client.get("/api/clubs")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


@pytest.mark.asyncio
async def test_create_club(client):
    login_resp = await client.post("/api/auth/login", json={
        "login": "admin",
        "password": "admin",
    })
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    resp = await client.post("/api/clubs", json={
        "name": f"Клуб {uuid.uuid4().hex[:4]}",
        "city": "Москва",
        "description": "Какой-то клуб",
        "chairman_name": "Иванов Иван Иванович",
    }, headers=headers)
    assert resp.status_code == 201
    assert resp.json()["name"].startswith("Клуб")


@pytest.mark.asyncio
async def test_cannot_create_duplicate_club(client):
    login_resp = await client.post("/api/auth/login", json={
        "login": "admin",
        "password": "admin",
    })
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    name = f"Клуб {uuid.uuid4().hex[:4]}"
    await client.post("/api/clubs", json={"name": name, "city": "Москва", "chairman_name": "Иванов И.И."}, headers=headers)
    resp = await client.post("/api/clubs", json={"name": name, "city": "Москва", "chairman_name": "Иванов И.И."}, headers=headers)
    assert resp.status_code == 409