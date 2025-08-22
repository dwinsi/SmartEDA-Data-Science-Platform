
"""
File handling routes for SmartEDA Platform.

This module provides API endpoints for file upload, validation, metadata extraction,
and dataset management for the SmartEDA platform. Integrates with MongoDB for file
tracking and user management.
"""

import io
import uuid
import traceback
from pathlib import Path
from typing import Any

import pandas as pd
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import JSONResponse

from app.database.connection import get_database
from app.services.database_service import DatasetService
from app.models.database import DatasetType
from app.settings import get_settings

# Constants
SUPPORTED_EXTENSIONS = {'.csv', '.xlsx', '.xls'}
SAMPLE_ROWS_COUNT = 5
DEFAULT_DATASET_LIMIT = 50
BYTES_TO_MB = 1024 * 1024


router = APIRouter()
settings = get_settings()

# Ensure upload directory exists
upload_dir = Path(settings.upload_dir)
upload_dir.mkdir(exist_ok=True)




@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    user_id: str = "anonymous"
) -> JSONResponse:
    """
    Upload and process CSV/Excel files for EDA analysis.

    Args:
        file (UploadFile): The uploaded file object.
        user_id (str): The user ID (default: "anonymous").

    Returns:
        JSONResponse: Metadata about the uploaded dataset.
    """
    filename = file.filename if file.filename else "uploaded_file"
    ext = Path(filename).suffix.lower()
    if ext not in SUPPORTED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Unsupported file type.")

    try:
        file_id = str(uuid.uuid4())
        file_path = upload_dir / f"{file_id}{ext}"
        contents = await file.read()
        with open(file_path, "wb") as f:
            f.write(contents)

        if ext == ".csv":
            df = pd.read_csv(io.BytesIO(contents), nrows=DEFAULT_DATASET_LIMIT) # type: ignore
        else:
            df = pd.read_excel(io.BytesIO(contents), nrows=DEFAULT_DATASET_LIMIT) # type: ignore

        row_count, column_count = df.shape
        numerical_columns = df.select_dtypes(include=["number"]).columns.tolist()
        categorical_columns = df.select_dtypes(exclude=["number"]).columns.tolist()

        db = None
        try:
            db = await get_database() # type: ignore
        except (ConnectionError, RuntimeError):
            db = None

        if not db:
            return JSONResponse(
                status_code=200,
                content={
                    "data": {
                        "dataset_id": file_id,
                        "original_filename": file.filename,
                        "file_size": len(contents),
                        "file_type": ext[1:],
                        "row_count": row_count,
                        "column_count": column_count,
                        "numerical_columns": numerical_columns,
                        "categorical_columns": categorical_columns,
                        "created_at": pd.Timestamp.now().isoformat()
                    }
                }
            )

        try:
            # Map file extension to DatasetType
            ext_map = {
                "csv": DatasetType.CSV,
                "xlsx": DatasetType.EXCEL,
                "xls": DatasetType.EXCEL,
                "json": DatasetType.JSON
            }
            ext_key = ext[1:]
            file_type_enum = ext_map.get(ext_key, DatasetType.CSV)
            column_types = {str(col): str(dtype) for col, dtype in df.dtypes.items()}
            dataset_metadata = await DatasetService.create_dataset_metadata(
                filename=filename,
                original_filename=filename,
                storage_path=str(file_path),
                file_size=len(contents),
                file_type=file_type_enum,
                num_rows=row_count,
                num_columns=column_count,
                column_names=df.columns.tolist(),
                column_types=column_types,
                memory_usage=df.memory_usage(deep=True).sum() / BYTES_TO_MB,
                missing_values_total=int(df.isnull().sum().sum()),
                missing_values_percentage=float(df.isnull().sum().sum() / (row_count * column_count) * 100) if row_count * column_count > 0 else 0.0,
                duplicate_rows=int(df.duplicated().sum()),
                user_id=user_id
            )
            return JSONResponse(
                status_code=200,
                content={"data": dataset_metadata.model_dump()}
            )
        except (IOError, ValueError, TypeError) as db_exc:
            print("UPLOAD ERROR:", traceback.format_exc())
            return JSONResponse(
                status_code=200,
                content={
                    "data": {
                        "dataset_id": file_id,
                        "original_filename": file.filename,
                        "file_size": len(contents),
                        "file_type": ext[1:],
                        "row_count": row_count,
                        "column_count": column_count,
                        "numerical_columns": numerical_columns,
                        "categorical_columns": categorical_columns,
                        "created_at": pd.Timestamp.now().isoformat(),
                        "db_error": str(db_exc)
                    }
                }
            )
    except (ValueError, IOError, pd.errors.ParserError) as e:
        print("UPLOAD ERROR:", traceback.format_exc())
        return JSONResponse(
            status_code=500,
            content={"detail": str(e), "traceback": traceback.format_exc()}
        )
    



@router.get("/datasets")
async def list_datasets(
    user_id: str = "anonymous",
    limit: int = DEFAULT_DATASET_LIMIT,
    _db: Any = Depends(get_database)
) -> JSONResponse:
    """
    List all datasets uploaded by the user.

    Args:
        user_id (str): The user ID (default: "anonymous").
        limit (int): Max number of datasets to return.
        _db (Any): Database dependency (unused).

    Returns:
        JSONResponse: List of dataset metadata.
    """
    try:
        datasets = await DatasetService.get_user_datasets(user_id, limit)
        dataset_list = []
        for dataset in datasets:
            dataset_list.append({ # type: ignore
                "id": str(dataset.id),
                "filename": dataset.original_filename,
                "upload_date": dataset.uploaded_at.isoformat(),
                "rows": dataset.num_rows,
                "columns": dataset.num_columns,
                "file_size": dataset.file_size,
                "analyses_count": dataset.total_analyses
            })
        return JSONResponse(content={
            "status": "success",
            "data": dataset_list,
            "total": len(dataset_list) # type: ignore
        })
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to retrieve datasets: {str(e)}"
        ) from e




@router.get("/datasets/{dataset_id}")
async def get_dataset_details(
    dataset_id: str,
    _db: Any = Depends(get_database)
) -> JSONResponse:
    """
    Get detailed information about a specific dataset.

    Args:
        dataset_id (str): The dataset ID.
        _db (Any): Database dependency (unused).

    Returns:
        JSONResponse: Detailed metadata for the dataset.
    """
    try:
        dataset = await DatasetService.get_dataset_by_id(dataset_id)
        if not dataset:
            raise HTTPException(status_code=404, detail="Dataset not found")
        return JSONResponse(content={
            "status": "success",
            "data": {
                "id": str(dataset.id),
                "filename": dataset.original_filename,
                "upload_date": dataset.uploaded_at.isoformat(),
                "file_type": dataset.file_type.value,
                "file_size": dataset.file_size,
                "rows": dataset.num_rows,
                "columns": dataset.num_columns,
                "column_names": dataset.column_names,
                "column_types": dataset.column_types,
                "data_quality": {
                    "missing_values_total": dataset.missing_values_total,
                    "missing_values_percentage": dataset.missing_values_percentage,
                    "duplicate_rows": dataset.duplicate_rows,
                    "memory_usage_mb": dataset.memory_usage
                },
                "analyses_count": dataset.total_analyses,
                "last_analyzed": (
                    dataset.last_analyzed.isoformat() if dataset.last_analyzed else None
                )
            }
        })
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to retrieve dataset: {str(e)}"
        ) from e




@router.delete("/datasets/{dataset_id}")
async def delete_dataset(
    dataset_id: str,
    _db: Any = Depends(get_database)
) -> JSONResponse:
    """
    Delete a dataset and its associated file.

    Args:
        dataset_id (str): The dataset ID.
        _db (Any): Database dependency (unused).

    Returns:
        JSONResponse: Success message if deleted.
    """
    try:
        dataset = await DatasetService.get_dataset_by_id(dataset_id)
        if not dataset:
            raise HTTPException(status_code=404, detail="Dataset not found")
        file_path = Path(dataset.storage_path)
        if file_path.exists():
            file_path.unlink()
        await dataset.delete() # type: ignore
        return JSONResponse(content={
            "status": "success",
            "message": "Dataset deleted successfully"
        })
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to delete dataset: {str(e)}"
        ) from e




@router.get("/health")
async def files_health_check() -> JSONResponse:
    """
    Health check for file service.

    Returns:
        JSONResponse: Service health status and config info.
    """
    return JSONResponse(content={
        "status": "healthy",
        "service": "files",
        "upload_directory": str(upload_dir),
        "max_file_size": settings.max_file_size,
        "allowed_extensions": settings.allowed_extensions
    })
