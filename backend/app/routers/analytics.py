"""Spending analytics routes."""

from __future__ import annotations

from calendar import monthrange
from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlmodel import Session, select

from ..auth import get_current_user
from ..database import get_session
from ..models import Category, Transaction, User
from ..schemas import (
    AnalyticsBreakdown,
    AnalyticsSummary,
    BreakdownItem,
    MonthlyAnalytics,
    MonthlyCategorySpend,
    MonthlyHistoryPoint,
)

router = APIRouter(prefix="/analytics", tags=["analytics"])


def _month_bounds(d: date) -> tuple[date, date]:
    start = d.replace(day=1)
    end = d.replace(day=monthrange(d.year, d.month)[1])
    return start, end


def _shift_month(d: date, delta: int) -> date:
    year = d.year
    month = d.month + delta
    while month < 1:
        month += 12
        year -= 1
    while month > 12:
        month -= 12
        year += 1
    day = min(d.day, monthrange(year, month)[1])
    return date(year, month, day)


@router.get("/summary", response_model=AnalyticsSummary)
def summary(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
    start_date: Optional[date] = Query(default=None),
    end_date: Optional[date] = Query(default=None),
) -> AnalyticsSummary:
    stmt = select(Transaction).where(Transaction.user_id == current_user.id)
    if start_date is not None:
        stmt = stmt.where(Transaction.date >= start_date)
    if end_date is not None:
        stmt = stmt.where(Transaction.date <= end_date)
    rows = list(session.exec(stmt).all())

    total = sum(t.amount for t in rows)
    count = len(rows)
    average = (total / count) if count else 0.0

    today = date.today()
    cur_start, cur_end = _month_bounds(today)
    prev_ref = _shift_month(cur_start, -1)
    prev_start, prev_end = _month_bounds(prev_ref)

    # MoM uses full user history (not the optional date filter window).
    prev_rows = list(
        session.exec(
            select(Transaction).where(
                Transaction.user_id == current_user.id,
                Transaction.date >= prev_start,
                Transaction.date <= prev_end,
            )
        ).all()
    )
    cur_rows = list(
        session.exec(
            select(Transaction).where(
                Transaction.user_id == current_user.id,
                Transaction.date >= cur_start,
                Transaction.date <= cur_end,
            )
        ).all()
    )
    current_month_total = sum(t.amount for t in cur_rows)
    previous_month_total = sum(t.amount for t in prev_rows)
    delta = current_month_total - previous_month_total
    pct = (
        (delta / previous_month_total) * 100.0
        if previous_month_total != 0
        else None
    )

    return AnalyticsSummary(
        total_amount=round(total, 2),
        transaction_count=count,
        average_amount=round(average, 2),
        current_month_total=round(current_month_total, 2),
        previous_month_total=round(previous_month_total, 2),
        month_over_month_delta=round(delta, 2),
        month_over_month_pct=round(pct, 2) if pct is not None else None,
    )


@router.get("/breakdown", response_model=AnalyticsBreakdown)
def breakdown(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
    start_date: Optional[date] = Query(default=None),
    end_date: Optional[date] = Query(default=None),
) -> AnalyticsBreakdown:
    stmt = select(Transaction).where(Transaction.user_id == current_user.id)
    if start_date is not None:
        stmt = stmt.where(Transaction.date >= start_date)
    if end_date is not None:
        stmt = stmt.where(Transaction.date <= end_date)
    rows = list(session.exec(stmt).all())

    categories = {
        c.id: c for c in session.exec(select(Category)).all() if c.id is not None
    }

    buckets: dict[int, dict] = {}
    for t in rows:
        bucket = buckets.setdefault(
            t.category_id,
            {"total": 0.0, "count": 0},
        )
        bucket["total"] += t.amount
        bucket["count"] += 1

    grand_total = sum(b["total"] for b in buckets.values())
    items: list[BreakdownItem] = []
    for cat_id, bucket in buckets.items():
        cat = categories.get(cat_id)
        items.append(
            BreakdownItem(
                category_id=cat_id,
                category_name=cat.name if cat else "Unknown",
                color=cat.color if cat else "#9CA3AF",
                total=round(bucket["total"], 2),
                count=bucket["count"],
                pct_of_total=round(
                    (bucket["total"] / grand_total) * 100.0 if grand_total else 0.0,
                    2,
                ),
            )
        )
    items.sort(key=lambda i: i.total, reverse=True)

    return AnalyticsBreakdown(
        total_amount=round(grand_total, 2),
        items=items,
    )


@router.get("/monthly", response_model=MonthlyAnalytics)
def monthly(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> MonthlyAnalytics:
    """Current-month spend vs budgets plus a short monthly history."""
    today = date.today()
    cur_start, cur_end = _month_bounds(today)

    categories = list(session.exec(select(Category)).all())
    cur_rows = list(
        session.exec(
            select(Transaction).where(
                Transaction.user_id == current_user.id,
                Transaction.date >= cur_start,
                Transaction.date <= cur_end,
            )
        ).all()
    )

    spent_by_cat: dict[int, float] = {}
    for t in cur_rows:
        spent_by_cat[t.category_id] = spent_by_cat.get(t.category_id, 0.0) + t.amount

    by_category = [
        MonthlyCategorySpend(
            category=c.name,
            amount=round(spent_by_cat.get(c.id or 0, 0.0), 2),
            budget_limit=c.budget_limit,
            color=c.color,
        )
        for c in categories
        if c.id is not None
    ]
    by_category.sort(key=lambda i: i.amount, reverse=True)
    total = round(sum(i.amount for i in by_category), 2)

    history: list[MonthlyHistoryPoint] = []
    for delta in range(-5, 1):
        ref = _shift_month(cur_start, delta)
        start, end = _month_bounds(ref)
        rows = list(
            session.exec(
                select(Transaction).where(
                    Transaction.user_id == current_user.id,
                    Transaction.date >= start,
                    Transaction.date <= end,
                )
            ).all()
        )
        history.append(
            MonthlyHistoryPoint(
                month=ref.strftime("%b"),
                total=round(sum(t.amount for t in rows), 2),
            )
        )

    return MonthlyAnalytics(
        month=today.strftime("%Y-%m"),
        total=total,
        by_category=by_category,
        history=history,
    )
