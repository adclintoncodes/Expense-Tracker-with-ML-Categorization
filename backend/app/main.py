"""FastAPI application entrypoint."""

from __future__ import annotations

import os
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from sqlmodel import Session

from .database import create_db_and_tables, engine
from .routers import analytics, auth, categories, predict, transactions
from .seed import run_seed


def _resolve_frontend_dist() -> Path | None:
    """Locate the built React app for same-origin production serving."""
    env = os.getenv("FRONTEND_DIST", "").strip()
    candidates = []
    if env:
        candidates.append(Path(env))
    here = Path(__file__).resolve()
    candidates.extend(
        [
            here.parents[1] / "static",  # Docker: /app/static
            here.parents[2] / "frontend" / "dist",  # monorepo: ../frontend/dist
        ]
    )
    for path in candidates:
        if (path / "index.html").is_file():
            return path
    return None


FRONTEND_DIST = _resolve_frontend_dist()


@asynccontextmanager
async def lifespan(_: FastAPI):
    create_db_and_tables()
    with Session(engine) as session:
        run_seed(session)
    yield


app = FastAPI(
    title="Expense Tracker API",
    description="Auth, transactions, ML predict, analytics — optionally serves the React SPA",
    version="0.3.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
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


if FRONTEND_DIST is not None:
    assets_dir = FRONTEND_DIST / "assets"
    if assets_dir.is_dir():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

    @app.get("/")
    async def spa_root() -> FileResponse:
        return FileResponse(FRONTEND_DIST / "index.html")

    @app.get("/{full_path:path}")
    async def spa_fallback(full_path: str) -> FileResponse:
        # API + docs routes are registered above and win first.
        candidate = FRONTEND_DIST / full_path
        if candidate.is_file():
            return FileResponse(candidate)
        return FileResponse(FRONTEND_DIST / "index.html")
