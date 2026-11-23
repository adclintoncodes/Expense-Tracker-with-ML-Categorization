"""ML category prediction routes."""

from __future__ import annotations

import logging
from typing import Any, Optional

from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from ..auth import get_current_user
from ..database import BACKEND_ROOT, get_session
from ..models import Category, User
from ..schemas import PredictRequest, PredictResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/predict", tags=["predict"])

MODEL_PATH = BACKEND_ROOT / "ml" / "models" / "category_classifier.joblib"

_model_cache: dict[str, Any] = {"model": None, "loaded": False}


def _load_model() -> Any:
    if _model_cache["loaded"]:
        return _model_cache["model"]
    _model_cache["loaded"] = True
    if not MODEL_PATH.exists():
        logger.warning("ML model not found at %s; using fallback predictor", MODEL_PATH)
        _model_cache["model"] = None
        return None
    try:
        import joblib

        _model_cache["model"] = joblib.load(MODEL_PATH)
        return _model_cache["model"]
    except Exception as exc:  # noqa: BLE001
        logger.warning("Failed to load ML model: %s", exc)
        _model_cache["model"] = None
        return None


def _normalize_prediction(result: Any) -> Optional[tuple[str, float]]:
    if isinstance(result, dict):
        return str(result.get("category", "Other")), float(result.get("confidence", 0.0))
    if isinstance(result, (tuple, list)) and len(result) >= 2:
        return str(result[0]), float(result[1])
    return None


def _predict_with_utils(description: str) -> Optional[tuple[str, float]]:
    """Prefer helpers from backend/ml/predict_utils.py when available."""
    try:
        import sys

        ml_dir = str(BACKEND_ROOT / "ml")
        if ml_dir not in sys.path:
            sys.path.insert(0, ml_dir)
        import predict_utils  # type: ignore

        if hasattr(predict_utils, "predict_category"):
            return _normalize_prediction(
                predict_utils.predict_category(description, model_path=str(MODEL_PATH))
            )
        if hasattr(predict_utils, "predict"):
            return _normalize_prediction(
                predict_utils.predict(description, model_path=str(MODEL_PATH))
            )
    except Exception as exc:  # noqa: BLE001
        logger.debug("predict_utils unavailable: %s", exc)
    return None


def _predict_with_model(description: str, model: Any) -> Optional[tuple[str, float]]:
    try:
        if hasattr(model, "predict_proba"):
            proba = model.predict_proba([description])[0]
            classes = list(getattr(model, "classes_", []))
            if not classes:
                return None
            idx = int(proba.argmax())
            return str(classes[idx]), float(proba[idx])
        if hasattr(model, "predict"):
            label = model.predict([description])[0]
            return str(label), 0.5
    except Exception as exc:  # noqa: BLE001
        logger.warning("Model prediction failed: %s", exc)
    return None


def _fallback_predict(description: str) -> tuple[str, float]:
    """Simple keyword fallback when the joblib model is missing."""
    text = description.lower()
    rules = [
        ("Food & Dining", ["restaurant", "cafe", "coffee", "dining", "uber eats", "doordash"]),
        ("Groceries", ["grocery", "supermarket", "walmart", "costco", "trader joe", "whole foods"]),
        ("Shopping", ["amazon", "mall", "store", "retail", "target", "shop"]),
        ("Transportation", ["uber", "lyft", "gas", "fuel", "metro", "parking", "transit"]),
    ]
    for category, keywords in rules:
        if any(k in text for k in keywords):
            return category, 0.55
    return "Other", 0.35


def predict_category_label(description: str) -> tuple[str, float]:
    utils_result = _predict_with_utils(description)
    if utils_result is not None:
        return utils_result

    model = _load_model()
    if model is not None:
        model_result = _predict_with_model(description, model)
        if model_result is not None:
            return model_result

    return _fallback_predict(description)


def resolve_category_id(session: Session, category_name: str) -> Optional[int]:
    cat = session.exec(select(Category).where(Category.name == category_name)).first()
    if cat is not None:
        return cat.id
    other = session.exec(select(Category).where(Category.name == "Other")).first()
    return other.id if other else None


@router.post("", response_model=PredictResponse)
def predict(
    payload: PredictRequest,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> PredictResponse:
    _ = current_user
    category, confidence = predict_category_label(payload.description.strip())
    category_id = resolve_category_id(session, category)
    return PredictResponse(
        category=category,
        confidence=round(float(confidence), 4),
        category_id=category_id,
    )
