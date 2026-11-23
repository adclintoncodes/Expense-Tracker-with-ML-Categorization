"""Authentication routes: register, login, me, logout."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlmodel import Session

from ..auth import (
    authenticate_user,
    create_access_token,
    get_current_user,
    get_password_hash,
    get_user_by_email,
)
from ..database import get_session
from ..models import User
from ..schemas import Message, Token, UserOut, UserRegister

router = APIRouter(prefix="/auth", tags=["auth"])


async def _extract_login_credentials(request: Request) -> tuple[str, str]:
    """Accept JSON {email, password} or OAuth2 form (username, password)."""
    content_type = (request.headers.get("content-type") or "").lower()
    if "application/json" in content_type:
        body = await request.json()
        email = body.get("email") or body.get("username") or ""
        password = body.get("password") or ""
    else:
        form = await request.form()
        email = form.get("username") or form.get("email") or ""
        password = form.get("password") or ""
    return str(email).strip(), str(password)


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(payload: UserRegister, session: Session = Depends(get_session)) -> User:
    if get_user_by_email(session, payload.email) is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    user = User(
        email=payload.email.lower().strip(),
        hashed_password=get_password_hash(payload.password),
        full_name=payload.full_name.strip() or payload.email.split("@")[0],
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@router.post("/login", response_model=Token)
async def login(request: Request, session: Session = Depends(get_session)) -> Token:
    email, password = await _extract_login_credentials(request)
    if not email or not password:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Email and password are required",
        )
    user = authenticate_user(session, email.lower(), password)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return Token(access_token=create_access_token(subject=user.email))


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)) -> User:
    return current_user


@router.post("/logout", response_model=Message)
def logout(current_user: User = Depends(get_current_user)) -> Message:
    """Client should discard the JWT; this endpoint confirms logout."""
    _ = current_user
    return Message(message="Logged out successfully")
