# ML model retrain (cron / compose profiles)

The category classifier lives at `backend/ml/models/category_classifier.joblib`.

## Fine-tune from user corrections (SQLite)

Uses `backend/scripts/retrain.py` — needs `user_corrected=1` rows in the DB.

```bash
docker compose --profile retrain run --rm retrain
```

Restart the API so it reloads the joblib (model is not hot-reloaded by default):

```bash
docker compose up -d --build backend
```

## Bootstrap train from CSV

Uses synthetic labels in `backend/ml/data/transactions.csv`:

```bash
docker compose --profile train run --rm train-model
```

## Host cron example

Weekly fine-tune from corrected transactions:

```cron
0 3 * * 0  cd /path/to/expense-tracker && docker compose --profile retrain run --rm retrain >> /var/log/expense-retrain.log 2>&1
```

## Local (no Docker)

```bash
cd backend
pip install -r requirements.txt

# Bootstrap from CSV
cd ml && python train_model.py && cd ..

# Or fine-tune from corrected DB rows
python scripts/retrain.py
```

## Notes

- Keep `scikit-learn`, `pandas`, `numpy`, and `joblib` in `backend/requirements.txt`
  so both serving (unpickle) and training succeed in the same image.
- Prefer committing a trained `.joblib` for out-of-the-box `docker compose up`
  unless the binary is too large for your VCS policy (see root `.gitignore`).
