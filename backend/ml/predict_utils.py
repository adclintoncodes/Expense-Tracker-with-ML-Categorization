"""Load the trained category classifier and predict categories."""

from __future__ import annotations

from pathlib import Path
from typing import Any

import joblib
import numpy as np

from preprocessing import clean_text

ML_DIR = Path(__file__).resolve().parent
DEFAULT_MODEL = ML_DIR / "models" / "category_classifier.joblib"

_model = None


def load_model(model_path: str | Path | None = None):
    """Load (or return cached) sklearn Pipeline from joblib."""
    global _model
    path = Path(model_path) if model_path else DEFAULT_MODEL
    if _model is None or model_path is not None:
        if not path.exists():
            raise FileNotFoundError(
                f"Model not found at {path}. Run train_model.py first."
            )
        loaded = joblib.load(path)
        if model_path is None:
            _model = loaded
        return loaded
    return _model


def predict_category(
    description: str,
    model=None,
    model_path: str | Path | None = None,
) -> dict[str, Any]:
    """
    Predict expense category for a transaction description.

    Returns:
        {"category": str, "confidence": float}
    """
    clf = model if model is not None else load_model(model_path)
    cleaned = clean_text(description)
    if not cleaned:
        return {"category": "Other", "confidence": 0.0}

    proba = clf.predict_proba([cleaned])[0]
    idx = int(np.argmax(proba))
    category = str(clf.classes_[idx])
    confidence = float(proba[idx])
    return {"category": category, "confidence": confidence}
