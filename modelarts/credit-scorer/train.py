"""
e-Khadi credit scoring model — Huawei ModelArts training job.

Trains a gradient-boosted classifier (LightGBM) on historical repayment data
exported from the e-Khadi PostgreSQL database.

Features (all derived from existing DB columns):
  - repayment_ratio        : paid / approved requests
  - outstanding_debt       : sum of PENDING repayment amounts
  - requests_this_month    : frequency signal
  - completed_cycles       : grant cycle consistency
  - credit_score           : current rule-based score (0-100)
  - request_amount         : normalised request size

Label: did the member repay within the grace period? (1=yes, 0=no)

Usage (ModelArts training job):
  python train.py \
    --data-url  obs://ekhadi-files/modelarts/training-data/latest.csv \
    --train-url obs://ekhadi-files/modelarts/models/credit-scorer/
"""

import argparse
import os
import json
import pandas as pd
import lightgbm as lgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score, classification_report

def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument('--data-url',  default=os.environ.get('DLS_DATA_URL', 'data/training.csv'))
    parser.add_argument('--train-url', default=os.environ.get('DLS_TRAIN_URL', 'output/'))
    return parser.parse_args()

FEATURES = [
    'repayment_ratio',
    'outstanding_debt',
    'requests_this_month',
    'completed_cycles',
    'credit_score',
    'request_amount',
]
LABEL = 'repaid_on_time'

def train(args):
    print(f"Loading data from {args.data_url}")
    df = pd.read_csv(args.data_url)

    df['repayment_ratio'] = df['repayment_ratio'].fillna(0.5)
    df[FEATURES] = df[FEATURES].fillna(0)

    X = df[FEATURES]
    y = df[LABEL]

    X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    model = lgb.LGBMClassifier(
        n_estimators=200,
        learning_rate=0.05,
        max_depth=4,
        class_weight='balanced',
        random_state=42,
        verbose=-1,
    )
    model.fit(X_train, y_train, eval_set=[(X_val, y_val)])

    val_preds = model.predict_proba(X_val)[:, 1]
    auc = roc_auc_score(y_val, val_preds)
    print(f"\nValidation AUC: {auc:.4f}")
    print(classification_report(y_val, model.predict(X_val)))

    os.makedirs(args.train_url, exist_ok=True)
    model_path = os.path.join(args.train_url, 'credit_scorer.txt')
    model.booster_.save_model(model_path)

    meta = {
        'auc': round(auc, 4),
        'features': FEATURES,
        'label': LABEL,
        'n_train': len(X_train),
        'n_val': len(X_val),
    }
    with open(os.path.join(args.train_url, 'meta.json'), 'w') as f:
        json.dump(meta, f, indent=2)

    print(f"\nModel saved to {model_path}")
    print(f"Meta: {json.dumps(meta, indent=2)}")

if __name__ == '__main__':
    train(parse_args())