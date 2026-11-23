"""Text preprocessing for expense transaction descriptions."""

from __future__ import annotations

import re

import numpy as np
import pandas as pd

# Lightweight English stop words (avoids requiring NLTK data downloads at import time).
STOP_WORDS = frozenset(
    {
        "a",
        "an",
        "the",
        "and",
        "or",
        "but",
        "in",
        "on",
        "at",
        "to",
        "for",
        "of",
        "as",
        "by",
        "with",
        "from",
        "is",
        "are",
        "was",
        "were",
        "be",
        "been",
        "being",
        "have",
        "has",
        "had",
        "do",
        "does",
        "did",
        "will",
        "would",
        "could",
        "should",
        "may",
        "might",
        "must",
        "shall",
        "can",
        "this",
        "that",
        "these",
        "those",
        "it",
        "its",
        "i",
        "you",
        "he",
        "she",
        "we",
        "they",
        "me",
        "him",
        "her",
        "us",
        "them",
        "my",
        "your",
        "our",
        "their",
        "what",
        "which",
        "who",
        "whom",
        "where",
        "when",
        "why",
        "how",
        "all",
        "each",
        "every",
        "both",
        "few",
        "more",
        "most",
        "other",
        "some",
        "such",
        "no",
        "nor",
        "not",
        "only",
        "own",
        "same",
        "so",
        "than",
        "too",
        "very",
        "just",
        "about",
        "into",
        "over",
        "after",
        "before",
        "between",
        "under",
        "again",
        "further",
        "then",
        "once",
        "here",
        "there",
        "up",
        "down",
        "out",
        "off",
        "above",
        "below",
        "if",
        "because",
        "until",
        "while",
        "during",
        "through",
        "am",
    }
)

_NON_ALPHA = re.compile(r"[^a-z\s]+")
_MULTI_SPACE = re.compile(r"\s+")


def clean_text(text: str) -> str:
    """Lowercase, strip numbers/special chars, remove English stop words."""
    if text is None or (isinstance(text, float) and np.isnan(text)):
        return ""
    text = str(text).lower()
    text = _NON_ALPHA.sub(" ", text)
    text = _MULTI_SPACE.sub(" ", text).strip()
    tokens = [t for t in text.split() if t and t not in STOP_WORDS]
    return " ".join(tokens)


def preprocess_series(descriptions: pd.Series | list[str]) -> pd.Series:
    """Apply clean_text to a series or list of descriptions."""
    series = pd.Series(descriptions, dtype="object")
    return series.map(clean_text)


def load_and_preprocess(csv_path: str) -> tuple[pd.Series, pd.Series]:
    """Load labeled CSV and return cleaned descriptions plus categories."""
    df = pd.read_csv(csv_path)
    if "description" not in df.columns or "category" not in df.columns:
        raise ValueError("CSV must contain 'description' and 'category' columns")
    X = preprocess_series(df["description"])
    y = df["category"].astype(str)
    return X, y
