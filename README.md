# Smart Expense Tracker with ML Categorization

An intelligent expense tracker that uses machine learning to automatically categorize transactions, analyze spending patterns, and help users better understand their finances.

## Features

- **Automatic Categorization:** Classify transactions into categories such as groceries, dining, transportation, and shopping.
- **Transaction Management:** Record and organize income and expenses.
- **Spending Analytics:** Visualize expenses and identify spending patterns.
- **Persistent Storage:** SQLite database (survives Docker restarts via a volume).

## Tech Stack

- **Frontend:** React (Vite) + nginx in production
- **Backend:** Python, FastAPI, Uvicorn
- **Database:** SQLite (`backend/data/expenses.db`)
- **Machine Learning:** scikit-learn pipeline (TF-IDF + LogisticRegression), joblib

## Quick start (Docker Compose)

Requires Docker Engine and the Compose plugin.

```bash
# One container: React SPA + FastAPI + SQLite + ML model
docker compose up --build
```

Open **http://localhost:8000** — UI and API share the same origin. Docs: `/docs`.

Optional split mode (nginx SPA + separate API):

```bash
docker compose --profile split up --build
```

| Mode   | URL                         | Notes                                      |
|--------|-----------------------------|--------------------------------------------|
| Unified (default) | http://localhost:8000 | SPA served by FastAPI                      |
| Split frontend    | http://localhost        | also `:5173`; `/api` → backend             |
| Split backend     | http://localhost:8000   | API only                                   |

Stop with `Ctrl+C` or `docker compose down`. SQLite data remains in `backend/data/`.

### Environment

Optional overrides (compose defaults are fine for local demos):

```bash
export SECRET_KEY='replace-me'
export JWT_SECRET_KEY='replace-me'   # used by the API; falls back to SECRET_KEY
docker compose up --build
```

### Retrain the ML model

```bash
# Fine-tune from user_corrected rows in SQLite
docker compose --profile retrain run --rm retrain

# Or bootstrap from CSV training data
docker compose --profile train run --rm train-model
```

See [devops/retrain-cron.md](devops/retrain-cron.md) for cron examples.

## Local development (without Docker)

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
mkdir -p data ml/models
# Optional: train the classifier
cd ml && python train_model.py && cd ..
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API: http://localhost:8000 — health check: `/health`

### Frontend

```bash
cd frontend
cp .env.example .env   # VITE_API_URL=http://localhost:8000
npm install
npm run dev
```

UI: http://localhost:5173

## Project layout

```
backend/           FastAPI app, SQLite data/, ML under ml/
frontend/          Vite + React; production Dockerfile uses nginx
devops/            Ops notes (retrain cron / compose profile)
docker-compose.yml backend + frontend (+ optional retrain profile)
```

## Future improvements

- Monthly budgets and spending alerts
- Recurring expense detection
- Personalized financial insights
