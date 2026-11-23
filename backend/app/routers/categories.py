"""Category listing routes."""

from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from ..auth import get_current_user
from ..database import get_session
from ..models import Category, User
from ..schemas import CategoryOut

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("", response_model=list[CategoryOut])
def list_categories(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> list[Category]:
    _ = current_user
    return list(session.exec(select(Category).order_by(Category.name)).all())
