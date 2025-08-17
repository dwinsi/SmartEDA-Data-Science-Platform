"""EDA service layer for SmartEDA Data Science Platform."""
from typing import Dict, Any, Optional

import pandas as pd

from app.utils.eda import profile_data


def run_profile_data(
    df: pd.DataFrame,
    target_column: Optional[str] = None,
    full: bool = False
) -> Dict[str, Any]:
    """Service wrapper for EDA logic.
    
    Validates parameters and calls profile_data.
    """
    # Treat None or empty string as no target
    target = target_column if target_column and target_column.strip() else None
    return profile_data(df, target, full) # type: ignore
