"""Seed default categories and an optional demo user."""

from __future__ import annotations

from sqlmodel import Session, select

from .auth import get_password_hash
from .models import Category, User

DEFAULT_CATEGORIES: list[dict] = [
    {"name": "Food & Dining", "color": "#800020", "icon": "utensils", "budget_limit": 200.0},
    {"name": "Shopping", "color": "#F472B6", "icon": "shopping-bag", "budget_limit": 150.0},
    {"name": "Groceries", "color": "#FB923C", "icon": "carrot", "budget_limit": 250.0},
    {"name": "Transportation", "color": "#A78BFA", "icon": "car", "budget_limit": 100.0},
    {"name": "Other", "color": "#60A5FA", "icon": "circle", "budget_limit": 80.0},
]

DEMO_USER = {
    "email": "clinton@example.com",
    "password": "password123",
    "full_name": "Clinton Adorsoo",
}


def seed_categories(session: Session) -> None:
    """Insert default categories if the table is empty / missing names."""
    existing = {c.name for c in session.exec(select(Category)).all()}
    for item in DEFAULT_CATEGORIES:
        if item["name"] not in existing:
            session.add(Category(**item))
    session.commit()


def seed_demo_user(session: Session) -> None:
    """Create the demo user if it does not already exist."""
    existing = session.exec(select(User).where(User.email == DEMO_USER["email"])).first()
    if existing is None:
        session.add(
            User(
                email=DEMO_USER["email"],
                hashed_password=get_password_hash(DEMO_USER["password"]),
                full_name=DEMO_USER["full_name"],
            )
        )
        session.commit()


def run_seed(session: Session) -> None:
    seed_categories(session)
    seed_demo_user(session)
