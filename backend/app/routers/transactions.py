"""Transaction CRUD routes."""

from __future__ import annotations

from datetime import date, datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, select

from ..auth import get_current_user
from ..database import get_session
from ..models import Category, Transaction, User
from ..schemas import CategoryOut, TransactionCreate, TransactionOut, TransactionUpdate

router = APIRouter(prefix="/transactions", tags=["transactions"])


def _get_owned_transaction(
    session: Session, transaction_id: int, user: User
) -> Transaction:
    tx = session.get(Transaction, transaction_id)
    if tx is None or tx.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")
    return tx


def _ensure_category(session: Session, category_id: int) -> Category:
    cat = session.get(Category, category_id)
    if cat is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid category_id")
    return cat


def _to_out(session: Session, tx: Transaction) -> TransactionOut:
    cat = session.get(Category, tx.category_id)
    return TransactionOut(
        id=tx.id or 0,
        user_id=tx.user_id,
        description=tx.description,
        amount=tx.amount,
        category_id=tx.category_id,
        date=tx.date,
        ml_predicted=tx.ml_predicted,
        user_corrected=tx.user_corrected,
        confidence=tx.confidence,
        created_at=tx.created_at,
        updated_at=tx.updated_at,
        category=CategoryOut.model_validate(cat) if cat else None,
    )


@router.get("", response_model=list[TransactionOut])
def list_transactions(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
    category_id: Optional[int] = Query(default=None),
    start_date: Optional[date] = Query(default=None),
    end_date: Optional[date] = Query(default=None),
    min_amount: Optional[float] = Query(default=None),
    max_amount: Optional[float] = Query(default=None),
    q: Optional[str] = Query(default=None, description="Search description"),
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
) -> list[TransactionOut]:
    stmt = select(Transaction).where(Transaction.user_id == current_user.id)
    if category_id is not None:
        stmt = stmt.where(Transaction.category_id == category_id)
    if start_date is not None:
        stmt = stmt.where(Transaction.date >= start_date)
    if end_date is not None:
        stmt = stmt.where(Transaction.date <= end_date)
    if min_amount is not None:
        stmt = stmt.where(Transaction.amount >= min_amount)
    if max_amount is not None:
        stmt = stmt.where(Transaction.amount <= max_amount)
    if q:
        stmt = stmt.where(Transaction.description.contains(q))
    stmt = stmt.order_by(Transaction.date.desc(), Transaction.id.desc()).offset(offset).limit(limit)
    return [_to_out(session, tx) for tx in session.exec(stmt).all()]


@router.post("", response_model=TransactionOut, status_code=status.HTTP_201_CREATED)
def create_transaction(
    payload: TransactionCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> TransactionOut:
    _ensure_category(session, payload.category_id)
    now = datetime.utcnow()
    tx = Transaction(
        user_id=current_user.id,
        description=payload.description.strip(),
        amount=payload.amount,
        category_id=payload.category_id,
        date=payload.date,
        ml_predicted=payload.ml_predicted,
        user_corrected=0,
        confidence=payload.confidence,
        created_at=now,
        updated_at=now,
    )
    session.add(tx)
    session.commit()
    session.refresh(tx)
    return _to_out(session, tx)


@router.get("/{transaction_id}", response_model=TransactionOut)
def get_transaction(
    transaction_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> TransactionOut:
    return _to_out(session, _get_owned_transaction(session, transaction_id, current_user))


def _apply_update(
    session: Session,
    transaction_id: int,
    payload: TransactionUpdate,
    current_user: User,
) -> TransactionOut:
    tx = _get_owned_transaction(session, transaction_id, current_user)
    data = payload.model_dump(exclude_unset=True)

    if "category_id" in data:
        _ensure_category(session, data["category_id"])
        if tx.ml_predicted and data["category_id"] != tx.category_id:
            tx.user_corrected = 1

    for field, value in data.items():
        if field == "description" and isinstance(value, str):
            value = value.strip()
        setattr(tx, field, value)

    tx.updated_at = datetime.utcnow()
    session.add(tx)
    session.commit()
    session.refresh(tx)
    return _to_out(session, tx)


@router.put("/{transaction_id}", response_model=TransactionOut)
def update_transaction(
    transaction_id: int,
    payload: TransactionUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> TransactionOut:
    return _apply_update(session, transaction_id, payload, current_user)


@router.patch("/{transaction_id}", response_model=TransactionOut)
def patch_transaction(
    transaction_id: int,
    payload: TransactionUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> TransactionOut:
    return _apply_update(session, transaction_id, payload, current_user)


@router.delete("/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(
    transaction_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> None:
    tx = _get_owned_transaction(session, transaction_id, current_user)
    session.delete(tx)
    session.commit()
