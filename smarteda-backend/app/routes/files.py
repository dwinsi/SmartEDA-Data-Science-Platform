"""File handling routes for SmartEDA Data Science Platform."""
from fastapi import APIRouter, UploadFile, File
from fastapi.responses import JSONResponse

from ..services.file_service import save_uploaded_file

router = APIRouter()


@router.post('/upload/')
async def upload_endpoint(file: UploadFile = File(...)):
    """File upload endpoint: accepts CSV files and saves them for analysis.
    
    Returns file information including columns and row count.
    """
    file_content = await file.read()
    result = save_uploaded_file(file_content, "uploaded.csv")
    return JSONResponse(content=result)
