"""EDA routes for SmartEDA Data Science Platform."""
from fastapi import APIRouter, Form
from fastapi.responses import JSONResponse
import pandas as pd

from ..services.eda_service import run_profile_data

router = APIRouter()


@router.post('/eda/')
def eda_endpoint(target_column: str = Form(''), full: bool = Form(False)):
    """EDA endpoint: returns profiling summary for uploaded data.
    
    Accepts optional target_column and full report flag.
    """
    df = pd.read_csv("uploaded.csv")  # type: ignore
    # Treat empty string as None for target_column
    target = target_column if target_column and target_column.strip() else None
    result = run_profile_data(df, target, full)
    return JSONResponse(content=result)
