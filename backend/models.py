import enum
from datetime import date, datetime, timezone
from sqlalchemy import String, Integer, Text, Date, DateTime, Enum, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


#  Перечисления

class UserRole(str, enum.Enum):
    GUEST = "Guest"
    USER = "User"
    EXPERT = "Expert"
    CHAIRMAN = "Chairman"
    ADMIN = "Admin"


class ExhibitionStatus(str, enum.Enum):
    PLANNED = "Planned"
    ACTIVE = "Active"
    FINISHED = "Finished"


class RequestStatus(str, enum.Enum):
    PENDING = "Pending"
    APPROVED = "Approved"
    REJECTED = "Rejected"


#  Модели

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    login: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), default=UserRole.USER, nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    passport: Mapped[str] = mapped_column(String(50), nullable=False)
    avatar_url: Mapped[str | None] = mapped_column(String(300), nullable=True)
    is_blocked: Mapped[bool] = mapped_column(default=False)

    dogs: Mapped[list["Dog"]] = relationship(back_populates="owner", foreign_keys="Dog.owner_id")


class Breed(Base):
    __tablename__ = "breeds"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)

    dogs: Mapped[list["Dog"]] = relationship(back_populates="breed")


class Club(Base):
    __tablename__ = "clubs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(150), unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(String(500), nullable=True)
    chairman_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("users.id"), nullable=True)

    chairman: Mapped["User | None"] = relationship(foreign_keys=[chairman_id])
    dogs: Mapped[list["Dog"]] = relationship(back_populates="club")
    experts: Mapped[list["Expert"]] = relationship(back_populates="club")


class Dog(Base):
    __tablename__ = "dogs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    breed_id: Mapped[int] = mapped_column(Integer, ForeignKey("breeds.id"), nullable=False)
    age: Mapped[int] = mapped_column(Integer, nullable=False)
    pedigree_number: Mapped[str | None] = mapped_column(String(50), nullable=True)
    father_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    mother_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    last_vaccination_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    owner_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    club_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("clubs.id"), nullable=True)
    photo_url: Mapped[str | None] = mapped_column(String(300), nullable=True)
    
    owner: Mapped["User"] = relationship(back_populates="dogs", foreign_keys=[owner_id])
    breed: Mapped["Breed"] = relationship(back_populates="dogs")
    club: Mapped["Club | None"] = relationship(back_populates="dogs")


class Exhibition(Base):
    __tablename__ = "exhibitions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    date: Mapped[date] = mapped_column(Date, nullable=False)
    address: Mapped[str | None] = mapped_column(String(300), nullable=True)
    status: Mapped[ExhibitionStatus] = mapped_column(Enum(ExhibitionStatus), default=ExhibitionStatus.PLANNED, nullable=False)
    organizer_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)

    organizer: Mapped["User"] = relationship(foreign_keys=[organizer_id])
    rings: Mapped[list["Ring"]] = relationship(back_populates="exhibition")


class Ring(Base):
    __tablename__ = "rings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    exhibition_id: Mapped[int] = mapped_column(Integer, ForeignKey("exhibitions.id", ondelete="CASCADE"), nullable=False)
    number: Mapped[str] = mapped_column(String(50), nullable=False)

    exhibition: Mapped["Exhibition"] = relationship(back_populates="rings")
    specializations: Mapped[list["RingSpecialization"]] = relationship(back_populates="ring")
    experts: Mapped[list["RingExpert"]] = relationship(back_populates="ring")


class RingSpecialization(Base):
    __tablename__ = "ring_specializations"

    ring_id: Mapped[int] = mapped_column(Integer, ForeignKey("rings.id"), primary_key=True)
    breed_id: Mapped[int] = mapped_column(Integer, ForeignKey("breeds.id"), primary_key=True)
    start_time: Mapped[str | None] = mapped_column(String(10), nullable=True)

    ring: Mapped["Ring"] = relationship(back_populates="specializations")
    breed: Mapped["Breed"] = relationship()


class Expert(Base):
    __tablename__ = "experts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    club_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("clubs.id"), nullable=True)

    user: Mapped["User"] = relationship(foreign_keys=[user_id])
    club: Mapped["Club | None"] = relationship(back_populates="experts")
    rings: Mapped[list["RingExpert"]] = relationship(back_populates="expert")
    specializations: Mapped[list["ExpertSpecialization"]] = relationship(back_populates="expert")


class ExpertSpecialization(Base):
    __tablename__ = "expert_specializations"

    expert_id: Mapped[int] = mapped_column(Integer, ForeignKey("experts.id"), primary_key=True)
    breed_id: Mapped[int] = mapped_column(Integer, ForeignKey("breeds.id"), primary_key=True)

    expert: Mapped["Expert"] = relationship(back_populates="specializations")
    breed: Mapped["Breed"] = relationship()


class RingExpert(Base):
    __tablename__ = "ring_experts"

    ring_id: Mapped[int] = mapped_column(Integer, ForeignKey("rings.id"), primary_key=True)
    expert_id: Mapped[int] = mapped_column(Integer, ForeignKey("experts.id"), primary_key=True)

    ring: Mapped["Ring"] = relationship(back_populates="experts")
    expert: Mapped["Expert"] = relationship(back_populates="rings")


class Result(Base):
    __tablename__ = "results"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    dog_id: Mapped[int] = mapped_column(Integer, ForeignKey("dogs.id"), nullable=False)
    exhibition_id: Mapped[int] = mapped_column(Integer, ForeignKey("exhibitions.id"), nullable=False)
    place: Mapped[int | None] = mapped_column(Integer, nullable=True)

    dog: Mapped["Dog"] = relationship()
    exhibition: Mapped["Exhibition"] = relationship()



class ClubRequest(Base):
    __tablename__ = "club_requests"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    club_name: Mapped[str] = mapped_column(String(150), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[RequestStatus] = mapped_column(Enum(RequestStatus), default=RequestStatus.PENDING, nullable=False)
    reject_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship(foreign_keys=[user_id])


class ExpertRequest(Base):
    __tablename__ = "expert_requests"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    experience: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[RequestStatus] = mapped_column(Enum(RequestStatus), default=RequestStatus.PENDING, nullable=False)
    reject_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship(foreign_keys=[user_id])
    specializations: Mapped[list["ExpertRequestSpecialization"]] = relationship(back_populates="request")


class ExpertRequestSpecialization(Base):
    __tablename__ = "expert_request_specializations"

    request_id: Mapped[int] = mapped_column(Integer, ForeignKey("expert_requests.id"), primary_key=True)
    breed_id: Mapped[int] = mapped_column(Integer, ForeignKey("breeds.id"), primary_key=True)

    request: Mapped["ExpertRequest"] = relationship(back_populates="specializations")
    breed: Mapped["Breed"] = relationship()


class ParticipationRequest(Base):
    __tablename__ = "participation_requests"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    dog_id: Mapped[int] = mapped_column(Integer, ForeignKey("dogs.id"), nullable=False)
    exhibition_id: Mapped[int] = mapped_column(Integer, ForeignKey("exhibitions.id"), nullable=False)
    status: Mapped[RequestStatus] = mapped_column(Enum(RequestStatus), default=RequestStatus.PENDING, nullable=False)
    reject_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    dog: Mapped["Dog"] = relationship(foreign_keys=[dog_id])
    exhibition: Mapped["Exhibition"] = relationship(foreign_keys=[exhibition_id])