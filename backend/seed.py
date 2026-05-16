import asyncio
from database import async_session_maker, create_tables
from models import User, UserRole, Breed, Club
from security import hash_password
from sqlalchemy import select


async def seed():
    await create_tables()

    async with async_session_maker() as db:
        # Админ
        result = await db.execute(select(User).where(User.login == "admin"))
        if not result.scalar_one_or_none():
            admin = User(
                login="admin",
                password_hash=hash_password("admin"),
                role=UserRole.ADMIN,
                full_name="Иванова Валерия Олеговна",
                passport="1234 567890",
            )
            db.add(admin)

        # Пользователи
        for i in range(1, 4):
            result = await db.execute(select(User).where(User.login == f"user{i}"))
            if not result.scalar_one_or_none():
                user = User(
                    login=f"user{i}",
                    password_hash=hash_password("password"),
                    role=UserRole.USER,
                    full_name=f"Пользователь {i}",
                    passport=f"{1000 + i} {200000 + i:06d}",
                )
                db.add(user)

        await db.flush()

        # Породы
        breeds_data = [
            "Немецкая овчарка", "Лабрадор", "Такса", "Сибирский хаски",
            "Пудель", "Английский бульдог", "Ротвейлер", "Доберман",
        ]
        for name in breeds_data:
            result = await db.execute(select(Breed).where(Breed.name == name))
            if not result.scalar_one_or_none():
                db.add(Breed(name=name))

        # Клубы
        clubs_data = [
            ("Чёрный плащ", "Клуб служебных и охранных пород"),
            ("Белый клык", "Клуб охотничьих пород"),
            ("Золотой ринг", "Объединённый клуб декоративных пород"),
        ]
        for name, desc in clubs_data:
            result = await db.execute(select(Club).where(Club.name == name))
            if not result.scalar_one_or_none():
                db.add(Club(name=name, description=desc))

        await db.commit()

    print("Seed completed: admin, 3 users, breeds, clubs created.")


if __name__ == "__main__":
    asyncio.run(seed())