import pandas as pd
from typing import Optional
from utils.eda import profile_data

# Service layer for EDA operations
def run_profile_data(df: pd.DataFrame, target_column: Optional[str] = None, full: bool = False): # type: ignore
    if target_column is not None:
        return profile_data(df, target_column, full) # type: ignore
    else:
        return profile_data(df, '', full) # type: ignore
