"""
ModelArts online inference service handler.
Deployed as a real-time inference endpoint.

POST /
Body: { "instances": [{ "repayment_ratio": 0.9, "outstanding_debt": 0, ... }] }
Returns: { "predictions": [{ "repay_probability": 0.92, "level": "HIGH_TRUST" }] }
"""

import json
import os
import lightgbm as lgb
import numpy as np
from model_service.tfserving_model_service import TfServingBaseService

FEATURES = [
    'repayment_ratio',
    'outstanding_debt',
    'requests_this_month',
    'completed_cycles',
    'credit_score',
    'request_amount',
]

def prob_to_level(p: float) -> str:
    if p >= 0.80: return 'HIGH_TRUST'
    if p >= 0.50: return 'MEDIUM_RISK'
    return 'FLAG'


class CreditScorerService(TfServingBaseService):
    def __init__(self, model_name, model_path):
        self.model = lgb.Booster(model_file=os.path.join(model_path, 'credit_scorer.txt'))

    def _preprocess(self, data):
        instances = data.get('instances', [data])
        rows = [[inst.get(f, 0) for f in FEATURES] for inst in instances]
        return np.array(rows, dtype=float)

    def _inference(self, X):
        return self.model.predict(X)

    def _postprocess(self, probs):
        return {
            'predictions': [
                {'repay_probability': round(float(p), 4), 'level': prob_to_level(p)}
                for p in probs
            ]
        }

    def execute(self, data):
        X = self._preprocess(data)
        probs = self._inference(X)
        return self._postprocess(probs)