#!/usr/bin/env python3
"""
Fine-tune the category classifier on user-corrected transactions.

Pulls rows where user_corrected=1 from the SQLite DB, fine-tunes (or
retrains) the model, and overwrites backend/ml/models/category_classifier.joblib.

Usage (from repo root or backend/):
  python backend/scripts/retrain.py
  python scripts/retrain.py
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parent.parent
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

MODEL_PATH = BACKEND_ROOT / "ml" / "models" / "category_classifier.joblib"
DB_PATH = BACKEND_ROOT / "data" / "expenses.db"


def _load_corrected_rows() -> list[tuple[str, str]]:
    """Return (description, category_name) for user_corrected=1 transactions."""
    from sqlmodel import Session, select

    from app.database import engine
    from app.models import Category, Transaction

    with Session(engine) as session:
        categories = {
            c.id: c.name
            for c in session.exec(select(Category)).all()
            if c.id is not None
        }
        rows = session.exec(
            select(Transaction).where(Transaction.user_corrected == 1)
        ).all()
        pairs: list[tuple[str, str]] = []
        for tx in rows:
            name = categories.get(tx.category_id)
            if name and tx.description:
                pairs.append((tx.description.strip(), name))
        return pairs


def _train_and_save(pairs: list[tuple[str, str]], model_path: Path) -> None:
    """Train a simple TF-IDF + LinearSVC pipeline and save as joblib."""
    try:
        import joblib
        from sklearn.feature_extraction.text import TfidfVectorizer
        from sklearn.pipeline import Pipeline
        from sklearn.svm import LinearSVC
    except ImportError as exc:
        raise SystemExit(
            "scikit-learn and joblib are required to retrain. "
            "Install them in the ML environment / requirements."
        ) from exc

    texts = [p[0] for p in pairs]
    labels = [p[1] for p in pairs]

    pipeline = None
    if model_path.exists():
        try:
            existing = joblib.load(model_path)
            # Fine-tune path: if helpers expose partial_fit / fit, prefer that.
            if hasattr(existing, "fit"):
                pipeline = existing
                print(f"Fine-tuning existing model at {model_path}")
        except Exception as exc:  # noqa: BLE001
            print(f"Could not load existing model for fine-tune ({exc}); retraining fresh")

    if pipeline is None:
        pipeline = Pipeline(
            steps=[
                ("tfidf", TfidfVectorizer(ngram_range=(1, 2), min_df=1)),
                ("clf", LinearSVC()),
            ]
        )
        print("Training a new TF-IDF + LinearSVC pipeline")

    # Prefer predict_utils.retrain / fine_tune when available.
    try:
        ml_dir = str(BACKEND_ROOT / "ml")
        if ml_dir not in sys.path:
            sys.path.insert(0, ml_dir)
        import predict_utils  # type: ignore

        if hasattr(predict_utils, "retrain"):
            predict_utils.retrain(texts, labels, model_path=str(model_path))
            print(f"Saved model via predict_utils.retrain -> {model_path}")
            return
        if hasattr(predict_utils, "fine_tune"):
            predict_utils.fine_tune(texts, labels, model_path=str(model_path))
            print(f"Saved model via predict_utils.fine_tune -> {model_path}")
            return
    except Exception as exc:  # noqa: BLE001
        print(f"predict_utils retrain unavailable ({exc}); using local trainer")

    pipeline.fit(texts, labels)
    model_path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(pipeline, model_path)
    print(f"Wrote {len(pairs)} corrected samples -> {model_path}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Retrain category classifier")
    parser.add_argument(
        "--model-path",
        type=Path,
        default=MODEL_PATH,
        help="Output joblib path",
    )
    parser.add_argument(
        "--min-samples",
        type=int,
        default=3,
        help="Minimum corrected rows required before training",
    )
    args = parser.parse_args()

    if not DB_PATH.exists():
        raise SystemExit(f"Database not found at {DB_PATH}. Start the API once to create it.")

    pairs = _load_corrected_rows()
    print(f"Found {len(pairs)} user-corrected transaction(s)")
    if len(pairs) < args.min_samples:
        raise SystemExit(
            f"Need at least {args.min_samples} corrected rows to retrain "
            f"(found {len(pairs)})."
        )

    unique_labels = {label for _, label in pairs}
    if len(unique_labels) < 2:
        raise SystemExit(
            "Need at least 2 distinct categories among corrected rows to train a classifier."
        )

    _train_and_save(pairs, args.model_path)


if __name__ == "__main__":
    main()
