"""ML service layer for SmartEDA Data Science Platform."""
from typing import Dict, Any

import pandas as pd

from app.utils.ml import train_model


def run_train_model(
    df: pd.DataFrame,
    target_column: str,
    model: str = "linear"
) -> Dict[str, Any]:
    """Service wrapper for ML training logic.
    
    Validates parameters and calls train_model.
    """
    if not target_column or target_column not in df.columns:
        return {"error": "Target column not specified or not found in data."}
    
    return train_model(df, target_column, model)  # type: ignore
