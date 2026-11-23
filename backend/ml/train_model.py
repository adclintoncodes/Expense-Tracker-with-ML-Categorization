"""Train TF-IDF + LogisticRegression category classifier and export joblib."""

from __future__ import annotations

import argparse
from pathlib import Path

import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline

from preprocessing import load_and_preprocess

ML_DIR = Path(__file__).resolve().parent
DEFAULT_DATA = ML_DIR / "data" / "transactions.csv"
DEFAULT_MODEL = ML_DIR / "models" / "category_classifier.joblib"


def build_pipeline() -> Pipeline:
    return Pipeline(
        steps=[
            (
                "tfidf",
                TfidfVectorizer(
                    ngram_range=(1, 2),
                    min_df=1,
                    max_df=0.95,
                    sublinear_tf=True,
                ),
            ),
            (
                "clf",
                LogisticRegression(
                    max_iter=1000,
                    class_weight="balanced",
                    random_state=42,
                ),
            ),
        ]
    )


def train(
    data_path: Path = DEFAULT_DATA,
    model_path: Path = DEFAULT_MODEL,
    test_size: float = 0.2,
    random_state: int = 42,
) -> float:
    X, y = load_and_preprocess(str(data_path))
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=test_size,
        random_state=random_state,
        stratify=y,
    )

    pipeline = build_pipeline()
    pipeline.fit(X_train, y_train)

    y_pred = pipeline.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)

    print(f"Samples: {len(X)} (train={len(X_train)}, test={len(X_test)})")
    print(f"Accuracy: {accuracy:.4f}")
    print("\nClassification report:")
    print(classification_report(y_test, y_pred))

    # Refit on all data before export for best production model.
    final = build_pipeline()
    final.fit(X, y)

    model_path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(final, model_path)
    print(f"Saved model -> {model_path}")
    return accuracy


def main() -> None:
    parser = argparse.ArgumentParser(description="Train expense category classifier")
    parser.add_argument("--data", type=Path, default=DEFAULT_DATA)
    parser.add_argument("--model", type=Path, default=DEFAULT_MODEL)
    parser.add_argument("--test-size", type=float, default=0.2)
    args = parser.parse_args()
    train(data_path=args.data, model_path=args.model, test_size=args.test_size)


if __name__ == "__main__":
    main()
