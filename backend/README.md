# Expense Tracker — Backend API

FastAPI + SQLite + SQLModel app with JWT auth, transaction CRUD, ML category
prediction, and spending analytics.

## Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

## Run

From the `backend/` directory:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Or from the repo root:

```bash
uvicorn app.main:app --app-dir backend --reload --host 0.0.0.0 --port 8000
```

- API docs: http://localhost:8000/docs
- Health: http://localhost:8000/health
- SQLite DB is created at `backend/data/expenses.db`
- Default categories and demo user are seeded on startup

### Demo user

- Email: `clinton@example.com`
- Password: `password123`

## Retrain ML model

After users correct ML predictions (`user_corrected=1`), fine-tune and overwrite
`ml/models/category_classifier.joblib`:

```bash
python scripts/retrain.py
```

## Environment

| Variable | Default | Purpose |
|----------|---------|---------|
| `JWT_SECRET_KEY` | dev secret | JWT signing key |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `1440` | Token lifetime |
