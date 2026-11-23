"""SQLModel / SQLAlchemy table models."""

from datetime import date as Date
from datetime import datetime
from typing import List, Optional

from sqlalchemy import Column, DateTime, Float, Integer, String, Text, UniqueConstraint
from sqlmodel import Field, Relationship, SQLModel


def _utcnow() -> datetime:
    return datetime.utcnow()


class User(SQLModel, table=True):
    __tablename__ = "users"
    __table_args__ = (UniqueConstraint("email", name="uq_users_email"),)

    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(sa_column=Column(String(255), nullable=False, index=True))
    hashed_password: str = Field(sa_column=Column(String(255), nullable=False))
    full_name: str = Field(sa_column=Column(String(255), nullable=False, default=""))
    created_at: datetime = Field(
        default_factory=_utcnow,
        sa_column=Column(DateTime, nullable=False, default=_utcnow),
    )

    transactions: List["Transaction"] = Relationship(back_populates="user")


class Category(SQLModel, table=True):
    __tablename__ = "categories"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(sa_column=Column(String(100), nullable=False, unique=True, index=True))
    color: str = Field(sa_column=Column(String(32), nullable=False, default="#60A5FA"))
    budget_limit: Optional[float] = Field(
        default=None,
        sa_column=Column(Float, nullable=True),
    )
    icon: Optional[str] = Field(default=None, sa_column=Column(String(64), nullable=True))

    transactions: List["Transaction"] = Relationship(back_populates="category")


class Transaction(SQLModel, table=True):
    __tablename__ = "transactions"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True, nullable=False)
    description: str = Field(sa_column=Column(Text, nullable=False))
    amount: float = Field(sa_column=Column(Float, nullable=False))
    category_id: int = Field(foreign_key="categories.id", index=True, nullable=False)
    date: Date = Field(nullable=False, index=True)
    ml_predicted: bool = Field(default=False, nullable=False)
    user_corrected: int = Field(
        default=0,
        sa_column=Column(Integer, nullable=False, default=0),
    )
    confidence: Optional[float] = Field(
        default=None,
        sa_column=Column(Float, nullable=True),
    )
    created_at: datetime = Field(
        default_factory=_utcnow,
        sa_column=Column(DateTime, nullable=False, default=_utcnow),
    )
    updated_at: datetime = Field(
        default_factory=_utcnow,
        sa_column=Column(DateTime, nullable=False, default=_utcnow, onupdate=_utcnow),
    )

    user: Optional[User] = Relationship(back_populates="transactions")
    category: Optional[Category] = Relationship(back_populates="transactions")
