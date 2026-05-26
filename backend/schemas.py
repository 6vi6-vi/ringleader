from datetime import date
from pydantic import BaseModel, Field

from models import UserRole


#  Общие

class StatusResponse(BaseModel):
    detail: str


#  Пользователь

class UserRegister(BaseModel):
    full_name: str = Field(min_length=2, max_length=255)
    passport: str = Field(min_length=5, max_length=50)
    login: str = Field(min_length=3, max_length=100)
    password: str = Field(min_length=4, max_length=100)


class UserLogin(BaseModel):
    login: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: UserRole
    full_name: str
    avatar_url: str | None = None


class UserOut(BaseModel):
    id: int
    login: str
    role: UserRole
    full_name: str
    passport: str
    avatar_url: str | None = None
    is_blocked: bool

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    full_name: str | None = Field(default=None, min_length=2, max_length=255)
    passport: str | None = Field(default=None, min_length=5, max_length=50)


class UserBlock(BaseModel):
    is_blocked: bool


#  Собака

class DogCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    breed_id: int
    age: int = Field(ge=0, le=30)
    pedigree_number: str | None = Field(default=None, max_length=50)
    father_name: str | None = Field(default=None, max_length=100)
    mother_name: str | None = Field(default=None, max_length=100)
    last_vaccination_date: date | None = None
    club_id: int | None = None

class DogOut(BaseModel):
    id: int
    name: str
    breed_id: int
    breed_name: str = ""
    age: int
    pedigree_number: str | None
    father_name: str | None
    mother_name: str | None
    last_vaccination_date: date | None
    owner_id: int
    owner_name: str = ""
    club_id: int | None
    club_name: str | None = None
    photo_url: str | None = None  

    class Config:
        from_attributes = True

class DogUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    breed_id: int | None = None
    age: int | None = Field(default=None, ge=0, le=30)
    pedigree_number: str | None = Field(default=None, max_length=50)
    father_name: str | None = Field(default=None, max_length=100)
    mother_name: str | None = Field(default=None, max_length=100)
    last_vaccination_date: date | None = None
    club_id: int | None = None


#  Порода

class BreedCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)


class BreedOut(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True