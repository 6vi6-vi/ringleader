import pytest
import uuid


@pytest.mark.asyncio
async def test_create_participation_request(client):
    # Админ для создания клуба и выставки
    admin_login = await client.post("/api/auth/login", json={
        "login": "admin", "password": "admin",
    })
    admin_token = admin_login.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # Обычный пользователь
    login = f"user_{uuid.uuid4().hex[:6]}"
    reg_resp = await client.post("/api/auth/register", json={
        "full_name": "Иванов Иван Иванович",
        "passport": "1234 567890",
        "login": login,
        "password": "password",
    })
    user_token = reg_resp.json()["access_token"]
    user_headers = {"Authorization": f"Bearer {user_token}"}

    # Создаём породу
    await client.post("/api/breeds", json={"name": "Овчарка"}, headers=admin_headers)

    # Пользователь создаёт собаку
    dog_resp = await client.post("/api/dogs", json={
        "name": "Рекс", "breed_id": 1, "age": 3,
    }, headers=user_headers)
    dog_id = dog_resp.json()["id"]

    # Админ создаёт клуб
    club_resp = await client.post("/api/clubs", json={
        "name": f"Клуб {uuid.uuid4().hex[:4]}",
        "city": "Москва",
        "chairman_name": "Иванов Иван Иванович",
    }, headers=admin_headers)

    # Админ создаёт выставку
    exh_resp = await client.post("/api/exhibitions", json={
        "name": f"Выставка {uuid.uuid4().hex[:4]}",
        "date": "2099-12-01",
        "address": "Москва, КВЦ",
    }, headers=admin_headers)
    exhibition_id = exh_resp.json()["id"]

    # Пользователь подаёт заявку
    resp = await client.post("/api/participation", json={
        "dog_id": dog_id,
        "exhibition_id": exhibition_id,
    }, headers=user_headers)
    assert resp.status_code == 201
    assert resp.json()["status"] == "Pending"


@pytest.mark.asyncio
async def test_cannot_apply_twice(client):
    admin_login = await client.post("/api/auth/login", json={
        "login": "admin", "password": "admin",
    })
    admin_token = admin_login.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    login = f"user_{uuid.uuid4().hex[:6]}"
    reg_resp = await client.post("/api/auth/register", json={
        "full_name": "Иванов Иван Иванович",
        "passport": "1234 567890",
        "login": login,
        "password": "password",
    })
    user_token = reg_resp.json()["access_token"]
    user_headers = {"Authorization": f"Bearer {user_token}"}

    await client.post("/api/breeds", json={"name": "Овчарка"}, headers=admin_headers)

    dog_resp = await client.post("/api/dogs", json={"name": "Рекс", "breed_id": 1, "age": 3}, headers=user_headers)
    dog_id = dog_resp.json()["id"]

    await client.post("/api/clubs", json={"name": f"Клуб {uuid.uuid4().hex[:4]}", "city": "Москва", "chairman_name": "Иванов И.И."}, headers=admin_headers)

    exh_resp = await client.post("/api/exhibitions", json={
        "name": f"Выставка {uuid.uuid4().hex[:4]}",
        "date": "2099-12-01",
        "address": "Москва, КВЦ",
    }, headers=admin_headers)
    exhibition_id = exh_resp.json()["id"]

    resp1 = await client.post("/api/participation", json={
        "dog_id": dog_id, "exhibition_id": exhibition_id,
    }, headers=user_headers)
    assert resp1.status_code == 201

    resp2 = await client.post("/api/participation", json={
        "dog_id": dog_id, "exhibition_id": exhibition_id,
    }, headers=user_headers)
    assert resp2.status_code == 409