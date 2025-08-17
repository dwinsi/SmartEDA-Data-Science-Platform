from fastapi import APIRouter, Form
from fastapi.responses import JSONResponse
import pandas as pd
from app.services.eda_service import run_profile_data

router = APIRouter()

@router.post('/eda/')
def eda_endpoint(target_column: str = Form(...), full: bool = Form(False)):
    df = pd.read_csv("uploaded.csv") # type: ignore
    result = run_profile_data(df, target_column, full) # type: ignore
    return JSONResponse(content=result)
