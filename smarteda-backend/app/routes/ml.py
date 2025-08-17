"""ML routes for SmartEDA Data Science Platform."""
from fastapi import APIRouter, Form
from fastapi.responses import JSONResponse
import pandas as pd

from ..services.ml_service import run_train_model

router = APIRouter()


@router.post('/ml/')
def ml_endpoint(target_column: str = Form(...), model: str = Form("linear")):
    """ML training endpoint: trains a model on uploaded data.
    
    Accepts target_column and model type (linear/logistic).
    """
    df = pd.read_csv("uploaded.csv")  # type: ignore
    result = run_train_model(df, target_column, model)
    return JSONResponse(content=result)
