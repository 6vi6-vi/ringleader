import os
import uuid
from datetime import date, datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import joinedload

from database import get_db
from models import User, UserRole, Dog, Breed, Club, Exhibition, ExhibitionStatus, Ring, RingSpecialization, RingExpert, Expert
from schemas import (
    UserRegister, UserLogin, TokenResponse, UserOut, UserUpdate, UserBlock,
    DogCreate, DogUpdate, DogOut,
    BreedCreate, BreedOut,
)
from security import hash_password, verify_password, create_access_token
from dependencies import get_current_user, get_admin_user


#  Роутеры

auth_router = APIRouter(prefix="/api/auth", tags=["auth"])
users_router = APIRouter(prefix="/api/users", tags=["users"])
dogs_router = APIRouter(prefix="/api/dogs", tags=["dogs"])
breeds_router = APIRouter(prefix="/api/breeds", tags=["breeds"])
clubs_router = APIRouter(prefix="/api/clubs", tags=["clubs"])
exhibitions_router = APIRouter(prefix="/api/exhibitions", tags=["exhibitions"])
participation_router = APIRouter(prefix="/api/participation", tags=["participation"])

UPLOAD_DIR = "uploads/dogs"
os.makedirs(UPLOAD_DIR, exist_ok=True)

UPLOAD_AVATARS_DIR = "uploads/avatars"
os.makedirs(UPLOAD_AVATARS_DIR, exist_ok=True)


#  Регистрация и вход

@auth_router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(data: UserRegister, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.login == data.login))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Пользователь с таким логином уже существует")

    user = User(
        login=data.login,
        password_hash=hash_password(data.password),
        role=UserRole.USER,
        full_name=data.full_name,
        passport=data.passport,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    access_token = create_access_token(data={"sub": str(user.id)})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "full_name": user.full_name,
        "avatar_url": user.avatar_url,
    }


@auth_router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.login == data.login))
    user = result.scalar_one_or_none()

    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Неверный логин или пароль")

    if user.is_blocked:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Пользователь заблокирован")

    access_token = create_access_token(data={"sub": str(user.id)})
    return TokenResponse(
        access_token=access_token,
        role=user.role,
        full_name=user.full_name,
        avatar_url=user.avatar_url,  
    )


@auth_router.get("/me", response_model=UserOut)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user


#  Пользователи

@users_router.get("", response_model=list[UserOut])
async def get_all_users(
    role: UserRole | None = None,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(User)
    if role:
        query = query.where(User.role == role)
    result = await db.execute(query)
    return result.scalars().all()


@users_router.get("/{user_id}", response_model=UserOut)
async def get_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.role != UserRole.ADMIN and current_user.id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Доступ запрещён")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Пользователь не найден")
    return user


@users_router.put("/{user_id}", response_model=UserOut)
async def update_user(
    user_id: int,
    data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.role != UserRole.ADMIN and current_user.id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Доступ запрещён")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Пользователь не найден")

    if data.full_name is not None:
        user.full_name = data.full_name
    if data.passport is not None:
        user.passport = data.passport

    await db.commit()
    await db.refresh(user)
    return user


@users_router.post("/me/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    ext = file.filename.split(".")[-1] if "." in (file.filename or "") else "jpg"
    filename = f"{uuid.uuid4()}.{ext}"
    filepath = os.path.join(UPLOAD_AVATARS_DIR, filename)

    with open(filepath, "wb") as f:
        f.write(await file.read())

    avatar_url = f"/uploads/avatars/{filename}"
    current_user.avatar_url = avatar_url
    await db.commit()
    await db.refresh(current_user)

    return {"avatar_url": avatar_url}


@users_router.post("/{user_id}/block", response_model=UserOut)
async def block_user(
    user_id: int,
    data: UserBlock,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    if admin.id == user_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Нельзя заблокировать самого себя")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Пользователь не найден")

    user.is_blocked = data.is_blocked
    await db.commit()
    await db.refresh(user)
    return user


@users_router.post("/{user_id}/reset-password")
async def reset_password(
    user_id: int,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Пользователь не найден")

    new_password = "reset123"
    user.password_hash = hash_password(new_password)
    await db.commit()
    return {"detail": f"Пароль сброшен. Новый пароль: {new_password}"}


#  Собаки

def _dog_to_out(d: Dog) -> DogOut:
    return DogOut(
        id=d.id,
        name=d.name,
        breed_id=d.breed_id,
        breed_name=d.breed.name if d.breed else "",
        age=d.age,
        pedigree_number=d.pedigree_number,
        father_name=d.father_name,
        mother_name=d.mother_name,
        last_vaccination_date=d.last_vaccination_date,
        owner_id=d.owner_id,
        owner_name=d.owner.full_name if d.owner else "",
        club_id=d.club_id,
        club_name=d.club.name if d.club else None,
        photo_url=d.photo_url,
    )


@dogs_router.get("", response_model=list[DogOut])
async def get_all_dogs(
    breed_id: int | None = None,
    owner_id: int | None = None,
    club_id: int | None = None,
    name: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    query = select(Dog).options(joinedload(Dog.breed), joinedload(Dog.owner), joinedload(Dog.club))
    if breed_id:
        query = query.where(Dog.breed_id == breed_id)
    if owner_id:
        query = query.where(Dog.owner_id == owner_id)
    if club_id:
        query = query.where(Dog.club_id == club_id)
    if name:
        query = query.where(Dog.name.ilike(f"%{name}%"))
    result = await db.execute(query)
    dogs = result.unique().scalars().all()
    return [_dog_to_out(d) for d in dogs]


@dogs_router.get("/{dog_id}", response_model=DogOut)
async def get_dog(dog_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Dog).options(joinedload(Dog.breed), joinedload(Dog.owner), joinedload(Dog.club)).where(Dog.id == dog_id)
    )
    d = result.unique().scalar_one_or_none()
    if not d:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Собака не найдена")
    return _dog_to_out(d)


@dogs_router.post("", response_model=DogOut, status_code=status.HTTP_201_CREATED)
async def create_dog(
    data: DogCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    dog = Dog(
        name=data.name,
        breed_id=data.breed_id,
        age=data.age,
        pedigree_number=data.pedigree_number,
        father_name=data.father_name,
        mother_name=data.mother_name,
        last_vaccination_date=data.last_vaccination_date,
        owner_id=current_user.id,
        club_id=data.club_id,
    )
    db.add(dog)
    await db.commit()
    await db.refresh(dog)

    result = await db.execute(
        select(Dog).options(joinedload(Dog.breed), joinedload(Dog.owner), joinedload(Dog.club)).where(Dog.id == dog.id)
    )
    d = result.unique().scalar_one()
    return _dog_to_out(d)


@dogs_router.put("/{dog_id}", response_model=DogOut)
async def update_dog(
    dog_id: int,
    data: DogUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Dog).options(joinedload(Dog.breed), joinedload(Dog.owner), joinedload(Dog.club)).where(Dog.id == dog_id)
    )
    dog = result.unique().scalar_one_or_none()
    if not dog:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Собака не найдена")

    if current_user.role != UserRole.ADMIN and dog.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Доступ запрещён")

    if data.name is not None:
        dog.name = data.name
    if data.breed_id is not None:
        dog.breed_id = data.breed_id
    if data.age is not None:
        dog.age = data.age
    if data.pedigree_number is not None:
        dog.pedigree_number = data.pedigree_number
    if data.father_name is not None:
        dog.father_name = data.father_name
    if data.mother_name is not None:
        dog.mother_name = data.mother_name
    if data.last_vaccination_date is not None:
        dog.last_vaccination_date = data.last_vaccination_date
    if "club_id" in data.model_dump(exclude_unset=True):
        dog.club_id = data.club_id

    await db.commit()
    await db.refresh(dog)
    return _dog_to_out(dog)

@dogs_router.post("/{dog_id}/photo")
async def upload_dog_photo(
    dog_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Dog).where(Dog.id == dog_id))
    dog = result.scalar_one_or_none()
    if not dog:
        raise HTTPException(status_code=404, detail="Собака не найдена")
    if current_user.role != UserRole.ADMIN and dog.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Доступ запрещён")

    ext = file.filename.split(".")[-1] if "." in (file.filename or "") else "jpg"
    filename = f"{uuid.uuid4()}.{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    with open(filepath, "wb") as f:
        f.write(await file.read())

    photo_url = f"/uploads/dogs/{filename}"
    dog.photo_url = photo_url 
    await db.commit()

    return {"photo_url": photo_url}

@dogs_router.delete("/{dog_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_dog(
    dog_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Dog).where(Dog.id == dog_id))
    dog = result.scalar_one_or_none()
    if not dog:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Собака не найдена")

    if current_user.role != UserRole.ADMIN and dog.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Доступ запрещён")

    # Проверить, участвовала ли собака в выставках
    from models import Result
    res = await db.execute(select(Result).where(Result.dog_id == dog_id))
    if res.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Нельзя удалить собаку, у которой есть результаты выступлений",
        )

    await db.delete(dog)
    await db.commit()


#  Породы

@breeds_router.get("", response_model=list[BreedOut])
async def get_all_breeds(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Breed).order_by(Breed.name))
    return result.scalars().all()


@breeds_router.post("", response_model=BreedOut, status_code=status.HTTP_201_CREATED)
async def create_breed(
    data: BreedCreate,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Breed).where(Breed.name == data.name))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Такая порода уже существует")

    breed = Breed(name=data.name)
    db.add(breed)
    await db.commit()
    await db.refresh(breed)
    return breed


@breeds_router.put("/{breed_id}", response_model=BreedOut)
async def update_breed(
    breed_id: int,
    data: BreedCreate,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Breed).where(Breed.id == breed_id))
    breed = result.scalar_one_or_none()
    if not breed:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Порода не найдена")

    breed.name = data.name
    await db.commit()
    await db.refresh(breed)
    return breed


@breeds_router.delete("/{breed_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_breed(
    breed_id: int,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Breed).where(Breed.id == breed_id))
    breed = result.scalar_one_or_none()
    if not breed:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Порода не найдена")

    await db.delete(breed)
    await db.commit()


# Клубы

@clubs_router.get("")
async def get_all_clubs(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Club).order_by(Club.name))
    clubs = result.scalars().all()
    return [
        {"id": c.id, "name": c.name, "description": c.description}
        for c in clubs
    ]


# Выставки

@exhibitions_router.get("")
async def get_all_exhibitions(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Exhibition)
        .options(joinedload(Exhibition.organizer))
        .order_by(Exhibition.date.asc())
    )
    exhibitions = result.unique().scalars().all()

    data = []
    for e in exhibitions:
        count = await db.scalar(
            select(func.count(ParticipationRequest.id)).where(
                ParticipationRequest.exhibition_id == e.id,
                ParticipationRequest.status == RequestStatus.APPROVED,
            )
        )
        data.append({
            "id": e.id,
            "name": e.name,
            "date": str(e.date),
            "address": e.address,
            "status": e.status.value,
            "organizer_name": e.organizer.full_name if e.organizer else None,
            "participants_count": count or 0,
        })

    return data
    

@dogs_router.get("/{dog_id}/exhibitions")
async def get_dog_exhibitions(dog_id: int, db: AsyncSession = Depends(get_db)):
    query = (
        select(Result, Exhibition, Ring)
        .join(Ring, Result.ring_id == Ring.id)
        .join(Exhibition, Ring.exhibition_id == Exhibition.id)
        .where(Result.dog_id == dog_id)
    )
    result = await db.execute(query)
    rows = result.all()

    return [
        {
            "id": exhibition.id,
            "name": exhibition.name,
            "date": str(exhibition.date),
            "address": exhibition.address,
            "place": res.place,
        }
        for res, exhibition, ring in rows
    ]

@exhibitions_router.post("", status_code=status.HTTP_201_CREATED)
async def create_exhibition(
    data: dict,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    exhibition = Exhibition(
        name=data["name"],
        date=date.fromisoformat(data["date"]),
        address=data.get("address"),
        status=ExhibitionStatus.PLANNED,
        organizer_id=admin.id,
    )
    db.add(exhibition)
    await db.commit()
    await db.refresh(exhibition)
    return {
        "id": exhibition.id,
        "name": exhibition.name,
        "date": str(exhibition.date),
        "address": exhibition.address,
        "status": exhibition.status.value,
        "organizer_name": admin.full_name,
    }

@exhibitions_router.get("/{exhibition_id}")
async def get_exhibition(
    exhibition_id: int,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Exhibition)
        .options(joinedload(Exhibition.organizer), joinedload(Exhibition.rings))
        .where(Exhibition.id == exhibition_id)
    )
    exhibition = result.unique().scalar_one_or_none()
    if not exhibition:
        raise HTTPException(status_code=404, detail="Выставка не найдена")

    # Количество участников (заявок)
    participants_count = await db.scalar(
        select(func.count(ParticipationRequest.id)).where(
            ParticipationRequest.exhibition_id == exhibition_id,
            ParticipationRequest.status == RequestStatus.APPROVED,
        )
    )

    # Список участников
    participants_result = await db.execute(
        select(ParticipationRequest, Dog, Breed)
        .join(Dog, ParticipationRequest.dog_id == Dog.id)
        .join(Breed, Dog.breed_id == Breed.id)
        .where(
            ParticipationRequest.exhibition_id == exhibition_id,
            ParticipationRequest.status == RequestStatus.APPROVED,
        )
    )
    participants = [
        {
            "id": req.id,
            "dog_id": dog.id,
            "dog_name": dog.name,
            "breed_name": breed.name,
            "owner_name": dog.owner.full_name if dog.owner else None,
            "club_name": dog.club.name if dog.club else None,
        }
        for req, dog, breed in participants_result
    ]

    return {
        "id": exhibition.id,
        "name": exhibition.name,
        "date": str(exhibition.date),
        "address": exhibition.address,
        "status": exhibition.status.value,
        "organizer_name": exhibition.organizer.full_name if exhibition.organizer else None,
        "participants_count": participants_count or 0,
        "rings": [{"id": r.id, "number": r.number} for r in exhibition.rings],
        "participants": participants,
    }


@exhibitions_router.put("/{exhibition_id}")
async def update_exhibition(
    exhibition_id: int,
    data: dict,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Exhibition).where(Exhibition.id == exhibition_id))
    exhibition = result.scalar_one_or_none()
    if not exhibition:
        raise HTTPException(status_code=404, detail="Выставка не найдена")

    if "name" in data:
        exhibition.name = data["name"]
    if "date" in data:
        exhibition.date = date.fromisoformat(data["date"])
    if "address" in data:
        exhibition.address = data["address"]
    if "status" in data:
        exhibition.status = ExhibitionStatus(data["status"])

    await db.commit()
    await db.refresh(exhibition)
    return {
        "id": exhibition.id,
        "name": exhibition.name,
        "date": str(exhibition.date),
        "address": exhibition.address,
        "status": exhibition.status.value,
    }


@exhibitions_router.delete("/{exhibition_id}", status_code=204)
async def delete_exhibition(
    exhibition_id: int,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Exhibition).where(Exhibition.id == exhibition_id))
    exhibition = result.scalar_one_or_none()
    if not exhibition:
        raise HTTPException(status_code=404, detail="Выставка не найдена")
    await db.delete(exhibition)
    await db.commit()


# ── Ринги ──

@exhibitions_router.get("/{exhibition_id}/rings")
async def get_exhibition_rings(exhibition_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Ring)
        .options(joinedload(Ring.specializations).joinedload(RingSpecialization.breed))
        .where(Ring.exhibition_id == exhibition_id)
    )
    rings = result.unique().scalars().all()
    return [
        {
            "id": r.id,
            "number": r.number,
            "specializations": [
                {"breed_id": s.breed_id, "breed_name": s.breed.name, "start_time": s.start_time}
                for s in r.specializations
            ],
        }
        for r in rings
    ]


@exhibitions_router.post("/{exhibition_id}/rings", status_code=201)
async def create_ring(
    exhibition_id: int,
    data: dict,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    ring = Ring(
        exhibition_id=exhibition_id,
        number=data["number"],
    )
    db.add(ring)
    await db.commit()
    await db.refresh(ring)
    return {"id": ring.id, "number": ring.number}


@exhibitions_router.put("/{exhibition_id}/rings/{ring_id}")
async def update_ring(
    exhibition_id: int,
    ring_id: int,
    data: dict,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Ring).where(Ring.id == ring_id, Ring.exhibition_id == exhibition_id))
    ring = result.scalar_one_or_none()
    if not ring:
        raise HTTPException(status_code=404, detail="Ринг не найден")
    if "number" in data:
        ring.number = data["number"]
    await db.commit()
    return {"id": ring.id, "number": ring.number}


@exhibitions_router.delete("/{exhibition_id}/rings/{ring_id}", status_code=204)
async def delete_ring(
    exhibition_id: int,
    ring_id: int,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Ring).where(Ring.id == ring_id, Ring.exhibition_id == exhibition_id))
    ring = result.scalar_one_or_none()
    if not ring:
        raise HTTPException(status_code=404, detail="Ринг не найден")
    await db.delete(ring)
    await db.commit()
