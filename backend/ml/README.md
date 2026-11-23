# Expense Tracker — ML Categorization Pipeline

Phase 1 ML pipeline that classifies transaction descriptions into:

- Food & Dining
- Shopping
- Groceries
- Transportation
- Other

## Layout

```
ml/
  data/transactions.csv          # Synthetic labeled training data (~325 rows)
  models/category_classifier.joblib
  preprocessing.py               # Lowercase, strip numbers/specials, stop words
  train_model.py                 # Train TF-IDF + LogisticRegression
  predict_utils.py               # load_model() / predict_category()
  README.md
```

## Setup

From the `backend/` directory:

```bash
pip install -r requirements.txt
```

## Train

```bash
cd backend/ml
python train_model.py
```

Prints hold-out accuracy, then refits on all data and writes
`models/category_classifier.joblib`.

## Predict

```python
from predict_utils import predict_category

print(predict_category("Starbucks coffee NYC"))
# {"category": "Food & Dining", "confidence": 0.87}
```

## Model

`sklearn.pipeline.Pipeline` with `TfidfVectorizer` (1–2 grams) and
`LogisticRegression` (`class_weight="balanced"`).
