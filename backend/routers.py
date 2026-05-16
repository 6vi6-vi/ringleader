from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import joinedload

from database import get_db
from models import User, UserRole, Dog, Breed
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


#  Регистрация и вход

@auth_router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
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
    return user


@auth_router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.login == data.login))
    user = result.scalar_one_or_none()

    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Неверный логин или пароль")

    if user.is_blocked:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Пользователь заблокирован")

    access_token = create_access_token(data={"sub": str(user.id)})
    return TokenResponse(access_token=access_token, role=user.role, full_name=user.full_name)


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
    )


@dogs_router.get("", response_model=list[DogOut])
async def get_all_dogs(
    breed_id: int | None = None,
    owner_id: int | None = None,
    club_id: int | None = None,
    db: AsyncSession = Depends(get_db),
):
    query = select(Dog).options(joinedload(Dog.breed), joinedload(Dog.owner), joinedload(Dog.club))
    if breed_id:
        query = query.where(Dog.breed_id == breed_id)
    if owner_id:
        query = query.where(Dog.owner_id == owner_id)
    if club_id:
        query = query.where(Dog.club_id == club_id)
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
    if data.club_id is not None:
        dog.club_id = data.club_id

    await db.commit()
    await db.refresh(dog)
    return _dog_to_out(dog)


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

    await db.delete(dog)
    await db.commit()


#  Породы

@breeds_router.get("", response_model=list[BreedOut])
async def get_all_breeds(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Breed))
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