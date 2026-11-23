"""FastAPI application entrypoint."""

from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session

from .database import create_db_and_tables, engine
from .routers import analytics, auth, categories, predict, transactions
from .seed import run_seed


@asynccontextmanager
async def lifespan(_: FastAPI):
    create_db_and_tables()
    with Session(engine) as session:
        run_seed(session)
    yield


app = FastAPI(
    title="Expense Tracker API",
    description="Phase 2 backend: auth, transactions, ML predict, analytics",
    version="0.2.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    # Explicit SPA origin + wildcard for other local / deployed frontends.
    # Credentials left False so "*" is valid for browser CORS with Bearer tokens.
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "*",
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(transactions.router)
app.include_router(predict.router)
app.include_router(categories.router)
app.include_router(analytics.router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
