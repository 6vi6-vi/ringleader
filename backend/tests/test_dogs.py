import pytest


@pytest.mark.asyncio
async def test_create_dog_requires_auth(client):
    response = await client.post("/api/dogs", json={
        "name": "Рекс",
        "breed_id": 1,
        "age": 3,
    })
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_create_dog_authenticated(client):
    # Регистрируемся
    await client.post("/api/auth/register", json={
        "full_name": "Иванов Иван Иванович",
        "passport": "1234 567890",
        "login": "dogowner",
        "password": "password",
    })
    login_resp = await client.post("/api/auth/login", json={
        "login": "dogowner",
        "password": "password",
    })
    token = login_resp.json()["access_token"]

    # Создаём породу
    from database import async_session_maker
    from models import Breed
    async with async_session_maker() as db:
        db.add(Breed(name="Овчарка"))
        await db.commit()

    response = await client.post(
        "/api/dogs",
        json={"name": "Рекс", "breed_id": 1, "age": 3},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 201
    assert response.json()["name"] == "Рекс"