"""Pydantic request / response schemas."""

from __future__ import annotations

from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


# ---------- Auth ----------


class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    full_name: str = ""


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    full_name: str
    created_at: datetime


class Message(BaseModel):
    message: str


# ---------- Categories ----------


class CategoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    color: str
    budget_limit: Optional[float] = None
    icon: Optional[str] = None


# ---------- Predict ----------


class PredictRequest(BaseModel):
    description: str = Field(min_length=1)


class PredictResponse(BaseModel):
    category: str
    confidence: float
    category_id: Optional[int] = None


# ---------- Transactions ----------


class TransactionCreate(BaseModel):
    description: str = Field(min_length=1)
    amount: float
    category_id: int
    date: date
    ml_predicted: bool = False
    confidence: Optional[float] = None


class TransactionUpdate(BaseModel):
    description: Optional[str] = None
    amount: Optional[float] = None
    category_id: Optional[int] = None
    date: Optional[date] = None
    confidence: Optional[float] = None


class TransactionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    description: str
    amount: float
    category_id: int
    date: date
    ml_predicted: bool
    user_corrected: int
    confidence: Optional[float] = None
    created_at: datetime
    updated_at: datetime
    category: Optional[CategoryOut] = None


# ---------- Analytics ----------


class AnalyticsSummary(BaseModel):
    total_amount: float
    transaction_count: int
    average_amount: float
    current_month_total: float
    previous_month_total: float
    month_over_month_delta: float
    month_over_month_pct: Optional[float] = None


class BreakdownItem(BaseModel):
    category_id: int
    category_name: str
    color: str
    total: float
    count: int
    pct_of_total: float


class AnalyticsBreakdown(BaseModel):
    total_amount: float
    items: list[BreakdownItem]


class MonthlyCategorySpend(BaseModel):
    category: str
    amount: float
    budget_limit: Optional[float] = None
    color: str


class MonthlyHistoryPoint(BaseModel):
    month: str
    total: float


class MonthlyAnalytics(BaseModel):
    month: str
    total: float
    by_category: list[MonthlyCategorySpend]
    history: list[MonthlyHistoryPoint]
