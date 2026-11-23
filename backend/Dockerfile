# Expense Tracker API — FastAPI + SQLite + bundled ML model
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# System deps occasionally needed by scientific / crypto wheels
RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --upgrade pip \
    && pip install -r requirements.txt

# Application package (resolves as `app.*` with WORKDIR=/app)
COPY app/ ./app/

# ML assets: preprocessing helpers + trained joblib under ml/models/
COPY ml/ ./ml/

# Ops scripts (e.g. scripts/retrain.py for compose --profile retrain)
COPY scripts/ ./scripts/

# SQLite persistence directory (compose mounts a volume here)
RUN mkdir -p /app/data /app/ml/models

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
