import pytest
import uuid


@pytest.mark.asyncio
async def test_create_dog_requires_auth(client):
    response = await client.post("/api/dogs", json={
        "name": "Рекс", "breed_id": 1, "age": 3,
    })
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_create_and_get_dog(client):
    login = f"owner_{uuid.uuid4().hex[:6]}"
    reg_resp = await client.post("/api/auth/register", json={
        "full_name": "Иванов Иван Иванович",
        "passport": "1234 567890",
        "login": login,
        "password": "password",
    })
    token = reg_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Создаём породу
    await client.post("/api/breeds", json={"name": "Овчарка"}, headers=headers)

    # Создаём собаку
    resp = await client.post("/api/dogs", json={
        "name": "Рекс", "breed_id": 1, "age": 3,
    }, headers=headers)
    assert resp.status_code == 201
    dog = resp.json()
    assert dog["name"] == "Рекс"

    # Получаем собаку по ID
    get_resp = await client.get(f"/api/dogs/{dog['id']}")
    assert get_resp.status_code == 200
    assert get_resp.json()["name"] == "Рекс"