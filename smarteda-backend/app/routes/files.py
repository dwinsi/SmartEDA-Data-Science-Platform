"""
File handling routes for SmartEDA Platform.

Handles CSV/Excel file uploads, validation, and metadata extraction.
Integrates with MongoDB for file tracking and user management.
"""

import io
import uuid
from pathlib import Path
from typing import Any

import pandas as pd
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import JSONResponse

from app.database.connection import get_database
from app.models.database import DatasetType
from app.services.database_service import DatasetService, AnalyticsService
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
    user_id: str = "anonymous",  # TODO: Get from JWT token
    _db: Any = Depends(get_database)  # pylint: disable=unused-argument
) -> JSONResponse:
    """
    Upload and process CSV/Excel files for EDA analysis.

    Features:
    - File validation and type checking
    - Automatic data profiling and metadata extraction
    - MongoDB storage for tracking and retrieval
    - Support for CSV and Excel formats
    """
    try:
        # Validate file type
        if not file.filename:
            raise HTTPException(status_code=400, detail="No filename provided")

        file_extension = Path(file.filename).suffix.lower()
        if file_extension not in SUPPORTED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=f"Only {', '.join(SUPPORTED_EXTENSIONS)} files are supported"
            )

        # Check file size
        content = await file.read()
        if len(content) > settings.max_file_size:
            raise HTTPException(
                status_code=413,
                detail=f"File too large. Max size: {settings.max_file_size} bytes"
            )

        # Generate unique filename
        file_id = str(uuid.uuid4())
        safe_filename = f"{file_id}_{file.filename}"
        file_path = upload_dir / safe_filename

        # Save file to disk
        with open(file_path, "wb") as f:
            f.write(content)

        # Read and analyze the data
        try:
            if file_extension == '.csv':
                df = pd.read_csv(io.BytesIO(content))  # type: ignore
                dataset_type = DatasetType.CSV
            else:
                df = pd.read_excel(io.BytesIO(content))  # type: ignore
                dataset_type = DatasetType.EXCEL
        except Exception as e:
            # Clean up file if parsing fails
            file_path.unlink(missing_ok=True)
            raise HTTPException(
                status_code=400,
                detail=f"Failed to parse file: {str(e)}"
            ) from e

        # Extract metadata
        num_rows, num_columns = df.shape
        column_names = df.columns.tolist()
        column_types = {col: str(dtype) for col, dtype in df.dtypes.items()}

        # Calculate data quality metrics
        missing_values_total = df.isnull().sum().sum()
        missing_values_percentage = (
            (missing_values_total / (num_rows * num_columns)) * 100
        )
        duplicate_rows = df.duplicated().sum()
        memory_usage = df.memory_usage(deep=True).sum() / BYTES_TO_MB

        # Store metadata in MongoDB
        dataset_metadata = await DatasetService.create_dataset_metadata(
            filename=safe_filename,
            original_filename=file.filename,
            file_type=dataset_type,
            file_size=len(content),
            user_id=user_id,
            storage_path=str(file_path),
            num_rows=num_rows,
            num_columns=num_columns,
            column_names=column_names,
            column_types=column_types,  # type: ignore
            memory_usage=memory_usage,
            missing_values_total=int(missing_values_total),
            missing_values_percentage=float(missing_values_percentage),
            duplicate_rows=int(duplicate_rows)
        )

        # Log analytics
        await AnalyticsService.log_usage(
            user_id=user_id,
            action="file_upload",
            resource_id=str(dataset_metadata.id),
            file_size=len(content),
            metadata={
                "filename": file.filename,
                "rows": num_rows,
                "columns": num_columns,
                "file_type": file_extension
            }
        )

        # Return comprehensive response
        return JSONResponse(content={
            "status": "success",
            "message": "File uploaded and processed successfully",
            "data": {
                "dataset_id": str(dataset_metadata.id),
                "filename": file.filename,
                "file_size": len(content),
                "rows": num_rows,
                "columns": num_columns,
                "column_names": column_names,
                "column_types": column_types,
                "data_quality": {
                    "missing_values_total": int(missing_values_total),
                    "missing_values_percentage": round(
                        float(missing_values_percentage), 2
                    ),
                    "duplicate_rows": int(duplicate_rows),
                    "memory_usage_mb": round(memory_usage, 2)
                },
                "sample_data": (
                    df.head(SAMPLE_ROWS_COUNT).to_dict('records')  # type: ignore
                )
            }
        })

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Internal server error: {str(e)}"
        ) from e


@router.get("/datasets")
async def list_datasets(
    user_id: str = "anonymous",  # TODO: Get from JWT token
    limit: int = DEFAULT_DATASET_LIMIT,
    _db: Any = Depends(get_database)  # pylint: disable=unused-argument
) -> JSONResponse:
    """List all datasets uploaded by the user."""
    try:
        datasets = await DatasetService.get_user_datasets(user_id, limit)

        dataset_list = []
        for dataset in datasets:
            dataset_list.append({  # type: ignore
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
            "total": len(dataset_list)  # type: ignore
        })

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to retrieve datasets: {str(e)}"
        ) from e


@router.get("/datasets/{dataset_id}")
async def get_dataset_details(
    dataset_id: str,
    _db: Any = Depends(get_database)  # pylint: disable=unused-argument
) -> JSONResponse:
    """Get detailed information about a specific dataset."""
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
                    "missing_values_percentage": (
                        dataset.missing_values_percentage
                    ),
                    "duplicate_rows": dataset.duplicate_rows,
                    "memory_usage_mb": dataset.memory_usage
                },
                "analyses_count": dataset.total_analyses,
                "last_analyzed": (
                    dataset.last_analyzed.isoformat()
                    if dataset.last_analyzed else None
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
    _db: Any = Depends(get_database)  # pylint: disable=unused-argument
) -> JSONResponse:
    """Delete a dataset and its associated file."""
    try:
        dataset = await DatasetService.get_dataset_by_id(dataset_id)
        if not dataset:
            raise HTTPException(status_code=404, detail="Dataset not found")

        # Delete physical file
        file_path = Path(dataset.storage_path)
        if file_path.exists():
            file_path.unlink()

        # Delete from database
        await dataset.delete()  # type: ignore

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
    """Health check for file service."""
    return JSONResponse(content={
        "status": "healthy",
        "service": "files",
        "upload_directory": str(upload_dir),
        "max_file_size": settings.max_file_size,
        "allowed_extensions": settings.allowed_extensions
    })
