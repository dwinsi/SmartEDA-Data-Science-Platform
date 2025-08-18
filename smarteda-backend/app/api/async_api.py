"""
Async API endpoints for SmartEDA Platform.

Provides asynchronous endpoints for long-running operations like:
- Dataset analysis
- Model training
- Report generation
- Vector database operations
"""

import os
import sys
from typing import Any, Dict, Optional

import pandas as pd
from fastapi import APIRouter, HTTPException

# Add the project root to Python path for imports
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

# Import application modules (after path setup)
from app.models.request_models import (  # type: ignore  # noqa: E402
    AnalysisRequest,
    ReportRequest,
    SimilaritySearchRequest,
    TrainingRequest,
)
from app.models.response_models import (  # type: ignore  # noqa: E402
    TaskResponse,
    TaskStatusResponse,
)
from app.services.vector_db import vector_db_service  # type: ignore  # noqa: E402
from app.settings import get_settings  # type: ignore  # noqa: E402

# Check if Celery is available
try:
    from celery.result import AsyncResult  # type: ignore

    from app.celery_app import celery_app  # type: ignore
    from app.tasks import (  # type: ignore
        analyze_dataset_async,  # type: ignore
        generate_report_async,  # type: ignore
        hyperparameter_tuning_async,  # type: ignore
        train_model_async,  # type: ignore
    )

    celery_available = True
except ImportError:
    celery_available = False
    AsyncResult = None
    celery_app = None
    analyze_dataset_async = None
    generate_report_async = None
    hyperparameter_tuning_async = None
    train_model_async = None

router = APIRouter(prefix="/async", tags=["Async Operations"])
settings = get_settings()


@router.post("/analyze", response_model=TaskResponse)
async def start_async_analysis(request: AnalysisRequest) -> TaskResponse:
    """
    Start asynchronous dataset analysis.

    This endpoint queues a long-running EDA analysis task and returns
    a task ID for monitoring progress.
    """
    if not celery_available:
        raise HTTPException(
            status_code=503,
            detail="Async processing not available. Install Celery dependencies.",
        )

    try:
        # Validate file exists
        if not os.path.exists(request.file_path):
            raise HTTPException(status_code=404, detail="Dataset file not found")

        # Start async task
        if analyze_dataset_async is not None:
            task = analyze_dataset_async.delay(  # type: ignore
                dataset_id=request.dataset_id,
                file_path=request.file_path,
                full_analysis=request.full_analysis,
            )

            return TaskResponse(
                task_id=task.id,
                status="queued",
                message="Analysis task started successfully",
            )
        else:
            raise HTTPException(
                status_code=503, detail="Analysis task not available"
            )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to start analysis: {str(e)}",
        ) from e


@router.post("/train", response_model=TaskResponse)
async def start_async_training(request: TrainingRequest) -> TaskResponse:
    """
    Start asynchronous model training.

    Queues a machine learning training task for the specified dataset.
    """
    if not celery_available:
        raise HTTPException(
            status_code=503,
            detail="Async processing not available. Install Celery dependencies.",
        )

    try:
        # Validate file and target column
        if not os.path.exists(request.file_path):
            raise HTTPException(status_code=404, detail="Dataset file not found")

        # Quick validation of target column
        df = pd.read_csv(request.file_path, nrows=1)  # type: ignore
        if request.target_column not in df.columns:
            raise HTTPException(
                status_code=400,
                detail=f"Target column '{request.target_column}' not found",
            )

        # Start async training task
        if train_model_async is not None:
            task = train_model_async.delay(  # type: ignore
                dataset_id=request.dataset_id,
                file_path=request.file_path,
                target_column=request.target_column,
                model_type=request.model_type,
                test_size=request.test_size,
            )

            return TaskResponse(
                task_id=task.id,
                status="queued",
                message="Training task started successfully",
            )
        else:
            raise HTTPException(
                status_code=503, detail="Training task not available"
            )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to start training: {str(e)}",
        ) from e


@router.post("/generate-report", response_model=TaskResponse)
async def start_report_generation(request: ReportRequest) -> TaskResponse:
    """
    Start asynchronous report generation.

    Generates comprehensive analysis reports in the background.
    """
    if not celery_available:
        raise HTTPException(
            status_code=503,
            detail="Async processing not available. Install Celery dependencies.",
        )

    try:
        # Start report generation task
        if generate_report_async is not None:
            task = generate_report_async.delay(  # type: ignore
                dataset_id=request.dataset_id,
                analysis_results=request.analysis_results,
                report_type=request.report_type,
            )

            return TaskResponse(
                task_id=task.id,
                status="queued",
                message="Report generation started successfully",
            )
        else:
            raise HTTPException(
                status_code=503, detail="Report generation task not available"
            )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to start report generation: {str(e)}",
        ) from e


@router.get("/task/{task_id}", response_model=TaskStatusResponse)
async def get_task_status(task_id: str) -> TaskStatusResponse:
    """
    Get the status and progress of an async task.

    Returns current status, progress, and results if completed.
    """
    if not celery_available:
        raise HTTPException(
            status_code=503,
            detail="Async processing not available. Install Celery dependencies.",
        )

    try:
        if AsyncResult is None or celery_app is None:
            raise HTTPException(
                status_code=503, detail="Celery result backend not available"
            )

        # Get task result
        task_result = AsyncResult(task_id, app=celery_app)  # type: ignore

        response = TaskStatusResponse(
            task_id=task_id,
            status=str(task_result.status).lower(),  # type: ignore
            message="Task status retrieved successfully",
            progress=None,
            result=None,
            error=None,
        )

        if task_result.status == "PENDING":  # type: ignore
            response.progress = {
                "current": 0,
                "total": 100,
                "status": "Task is waiting to be processed",
            }
        elif task_result.status == "PROGRESS":  # type: ignore
            response.progress = task_result.info  # type: ignore
        elif task_result.status == "SUCCESS":  # type: ignore
            response.result = task_result.result  # type: ignore
            response.progress = {
                "current": 100,
                "total": 100,
                "status": "Task completed successfully",
            }
        elif task_result.status == "FAILURE":  # type: ignore
            response.error = str(task_result.info)  # type: ignore
            response.progress = {
                "current": 100,
                "total": 100,
                "status": "Task failed",
            }

        return response

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get task status: {str(e)}",
        ) from e


@router.post("/vector-db/index-dataset")
async def index_dataset_in_vector_db(
    dataset_id: str,
    file_path: str,
    analysis_results: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Index a dataset in the vector database for similarity search.

    This enables semantic search and similarity matching across datasets.
    """
    try:
        # Validate file exists
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="Dataset file not found")

        # Load dataset
        df = pd.read_csv(file_path)  # type: ignore

        # Initialize vector DB if needed
        if not vector_db_service.is_initialized:
            init_success = vector_db_service.initialize()
            if not init_success:
                raise HTTPException(
                    status_code=503,
                    detail="Vector database not available. "
                    "Install required dependencies.",
                )

        # Add dataset to vector database with proper None handling
        success = vector_db_service.add_dataset_metadata(
            dataset_id=dataset_id,
            df=df,
            analysis_results=analysis_results or {},
        )

        if not success:
            raise HTTPException(status_code=500, detail="Failed to index dataset")

        return {
            "message": "Dataset indexed successfully",
            "dataset_id": dataset_id,
            "rows": len(df),
            "columns": len(df.columns),
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to index dataset: {str(e)}",
        ) from e


@router.post("/vector-db/search-similar")
async def search_similar_datasets(
    request: SimilaritySearchRequest,
) -> Dict[str, Any]:
    """
    Search for datasets similar to the provided query dataset.

    Uses semantic similarity to find related datasets in the vector database.
    """
    try:
        # Validate file exists
        if not os.path.exists(request.file_path):
            raise HTTPException(
                status_code=404, detail="Query dataset file not found"
            )

        # Load query dataset
        query_df = pd.read_csv(request.file_path)  # type: ignore

        # Check vector DB initialization
        if not vector_db_service.is_initialized:
            init_success = vector_db_service.initialize()
            if not init_success:
                raise HTTPException(
                    status_code=503,
                    detail="Vector database not available. "
                    "Install required dependencies.",
                )

        # Search for similar datasets
        similar_datasets = vector_db_service.search_similar_datasets(
            query_df=query_df, top_k=request.top_k
        )

        return {
            "query_dataset": {
                "file_path": request.file_path,
                "shape": [len(query_df), len(query_df.columns)],
            },
            "similar_datasets": similar_datasets,
            "total_found": len(similar_datasets),
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to search similar datasets: {str(e)}",
        ) from e


@router.get("/vector-db/stats")
async def get_vector_db_stats() -> Dict[str, Any]:
    """
    Get vector database statistics and health information.
    """
    try:
        # Initialize if needed
        if not vector_db_service.is_initialized:
            init_success = vector_db_service.initialize()
            if not init_success:
                return {
                    "status": "unavailable",
                    "message": "Vector database not available. "
                    "Install required dependencies.",
                }

        stats = vector_db_service.get_stats()
        stats["status"] = "available"

        return stats

    except Exception as e:
        return {
            "status": "error",
            "message": f"Failed to get vector database stats: {str(e)}",
        }


@router.delete("/task/{task_id}")
async def cancel_task(task_id: str) -> Dict[str, str]:
    """
    Cancel a running async task.

    Attempts to revoke the task if it hasn't started processing yet.
    """
    if not celery_available:
        raise HTTPException(
            status_code=503,
            detail="Async processing not available. Install Celery dependencies.",
        )

    try:
        if celery_app is None:
            raise HTTPException(
                status_code=503, detail="Celery app not available"
            )

        # Revoke the task
        celery_app.control.revoke(task_id, terminate=True)  # type: ignore

        return {
            "message": f"Task {task_id} cancellation requested",
            "task_id": task_id,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to cancel task: {str(e)}",
        ) from e


@router.post("/hyperparameter-tuning", response_model=TaskResponse)
async def start_hyperparameter_tuning(request: TrainingRequest) -> TaskResponse:
    """
    Start asynchronous hyperparameter tuning.

    Performs grid search to find optimal model parameters.
    """
    if not celery_available:
        raise HTTPException(
            status_code=503,
            detail="Async processing not available. Install Celery dependencies.",
        )

    try:
        # Validate inputs
        if not os.path.exists(request.file_path):
            raise HTTPException(status_code=404, detail="Dataset file not found")

        # Start hyperparameter tuning task
        if hyperparameter_tuning_async is not None:
            task = hyperparameter_tuning_async.delay(  # type: ignore
                dataset_id=request.dataset_id,
                file_path=request.file_path,
                target_column=request.target_column,
                model_type=request.model_type,
            )

            return TaskResponse(
                task_id=task.id,
                status="queued",
                message="Hyperparameter tuning started successfully",
            )
        else:
            raise HTTPException(
                status_code=503, detail="Hyperparameter tuning task not available"
            )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to start hyperparameter tuning: {str(e)}",
        ) from e
