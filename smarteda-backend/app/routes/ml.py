"""
Machine Learning routes for SmartEDA Platform.

Provides automated ML model training, evaluation, and comparison.
Supports classification and regression with multiple algorithms.
"""

import warnings
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List

import numpy as np
import pandas as pd
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import JSONResponse
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.metrics import (
    accuracy_score, classification_report, confusion_matrix, # type: ignore
    mean_absolute_error, mean_squared_error, r2_score
)
from sklearn.model_selection import cross_val_score, train_test_split # type: ignore
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.svm import SVC, SVR
from sklearn.tree import DecisionTreeClassifier, DecisionTreeRegressor

from app.database.connection import get_database
from app.models.database import (
    AnalysisStatus, MLModelResult
)
from app.services.database_service import (
    AnalysisService, DatasetService, AnalyticsService
)

warnings.filterwarnings('ignore')
router = APIRouter()


def prepare_features(df: pd.DataFrame, target_column: str) -> tuple[Any, ...]:
    """Prepare features and target for ML training."""
    # Separate features and target
    X = df.drop(columns=[target_column])
    y = df[target_column]

    # Handle categorical variables
    categorical_cols = X.select_dtypes(include=['object', 'category']).columns
    numerical_cols = X.select_dtypes(include=[np.number]).columns

    # For simplicity, drop categorical columns (in production, use proper encoding)
    X_processed = X[numerical_cols].copy()

    # Handle missing values (simple imputation)
    X_processed = X_processed.fillna(X_processed.median())  # type: ignore

    # Determine problem type
    if y.dtype == 'object' or y.nunique() < 10:  # type: ignore
        problem_type = "classification"
        if y.dtype == 'object':  # type: ignore
            le = LabelEncoder()
            y = le.fit_transform(y)  # type: ignore
        target_encoder = le if y.dtype == 'object' else None  # type: ignore
    else:
        problem_type = "regression"
        target_encoder = None

    return (X_processed, y, problem_type, target_encoder,
            list(categorical_cols), list(numerical_cols))


def train_classification_models(
    X_train: Any, X_test: Any, y_train: Any, y_test: Any
) -> List[Dict[str, Any]]:
    """Train multiple classification models and return results."""
    models = { # type: ignore
        "Logistic Regression": LogisticRegression(
            random_state=42, max_iter=1000
        ),
        "Random Forest": RandomForestClassifier(
            random_state=42, n_estimators=100
        ),
        "Decision Tree": DecisionTreeClassifier(random_state=42),
        "SVM": SVC(random_state=42, probability=True)
    }

    results = []
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train) # type: ignore
    X_test_scaled = scaler.transform(X_test) # type: ignore

    for name, model in models.items(): # type: ignore
        try:
            # Use scaled data for SVM and Logistic Regression
            if name in ["SVM", "Logistic Regression"]:
                model.fit(X_train_scaled, y_train) # type: ignore
                y_pred = model.predict(X_test_scaled) # type: ignore
                if hasattr(model, 'predict_proba'): # type: ignore
                    model.predict_proba(X_test_scaled)  # type: ignore
                cv_scores = cross_val_score(  # type: ignore
                    model, X_train_scaled, y_train, cv=5, scoring='accuracy' # type: ignore
                )
            else:
                model.fit(X_train, y_train) # type: ignore
                y_pred = model.predict(X_test) # type: ignore
                if hasattr(model, 'predict_proba'): # type: ignore
                    model.predict_proba(X_test)  # type: ignore
                cv_scores = cross_val_score(  # type: ignore
                    model, X_train, y_train, cv=5, scoring='accuracy' # type: ignore
                )

            # Calculate metrics
            accuracy = accuracy_score(y_test, y_pred) # type: ignore
            conf_matrix = confusion_matrix(y_test, y_pred).tolist() # type: ignore
            class_report = classification_report(  # type: ignore
                y_test, y_pred, output_dict=True # type: ignore
            )

            # Feature importance (if available)
            feature_importance = None
            if hasattr(model, 'feature_importances_'): # type: ignore
                feature_importance = model.feature_importances_.tolist() # type: ignore
            elif hasattr(model, 'coef_') and model.coef_.ndim == 1: # type: ignore
                feature_importance = abs(model.coef_).tolist() # type: ignore

            results.append({ # type: ignore
                "model_name": name,
                "algorithm_type": "classification",
                "metrics": {
                    "accuracy": round(float(accuracy), 4),
                    "cv_accuracy_mean": round(float(cv_scores.mean()), 4),
                    "cv_accuracy_std": round(float(cv_scores.std()), 4),
                    "confusion_matrix": conf_matrix,
                    "classification_report": class_report
                },
                "feature_importance": feature_importance,
                "training_time": 0.0,  # We'll add timing later
                "model_params": model.get_params() # type: ignore
            })

        except (ValueError, TypeError) as e:
            results.append({ # type: ignore
                "model_name": name,
                "algorithm_type": "classification",
                "error": str(e),
                "metrics": {},
                "feature_importance": None,
                "training_time": 0.0,
                "model_params": {}
            })

    return results # type: ignore


def train_regression_models(
    X_train: Any, X_test: Any, y_train: Any, y_test: Any
) -> List[Dict[str, Any]]:
    """Train multiple regression models and return results."""
    models = { # type: ignore
        "Linear Regression": LinearRegression(),
        "Random Forest": RandomForestRegressor(
            random_state=42, n_estimators=100
        ),
        "Decision Tree": DecisionTreeRegressor(random_state=42),
        "SVR": SVR()
    }

    results = []
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train) # type: ignore
    X_test_scaled = scaler.transform(X_test)  # type: ignore

    for name, model in models.items():  # type: ignore
        try:
            # Use scaled data for SVR and Linear Regression
            if name in ["SVR", "Linear Regression"]:
                model.fit(X_train_scaled, y_train)  # type: ignore
                y_pred = model.predict(X_test_scaled)  # type: ignore
                cv_scores = cross_val_score(  # type: ignore
                    model, X_train_scaled, y_train, cv=5, scoring='r2' # type: ignore
                )
            else:
                model.fit(X_train, y_train)  # type: ignore
                y_pred = model.predict(X_test)  # type: ignore
                cv_scores = cross_val_score(  # type: ignore
                    model, X_train, y_train, cv=5, scoring='r2' # type: ignore
                )

            # Calculate metrics
            mse = mean_squared_error(y_test, y_pred)  # type: ignore
            mae = mean_absolute_error(y_test, y_pred)  # type: ignore
            r2 = r2_score(y_test, y_pred)  # type: ignore
            rmse = np.sqrt(mse)

            # Feature importance (if available)
            feature_importance = None
            if hasattr(model, 'feature_importances_'): # type: ignore
                feature_importance = model.feature_importances_.tolist()  # type: ignore
            elif hasattr(model, 'coef_'): # type: ignore
                feature_importance = abs(model.coef_).tolist()  # type: ignore

            results.append({  # type: ignore
                "model_name": name,
                "algorithm_type": "regression",
                "metrics": {
                    "r2_score": round(float(r2), 4),
                    "mean_squared_error": round(float(mse), 4),
                    "root_mean_squared_error": round(float(rmse), 4),
                    "mean_absolute_error": round(float(mae), 4),
                    "cv_r2_mean": round(float(cv_scores.mean()), 4),
                    "cv_r2_std": round(float(cv_scores.std()), 4)
                },
                "feature_importance": feature_importance,
                "training_time": 0.0,
                "model_params": model.get_params()  # type: ignore
            })

        except Exception as e:
            results.append({  # type: ignore
                "model_name": name,
                "algorithm_type": "regression",
                "error": str(e),
                "metrics": {},
                "feature_importance": None,
                "training_time": 0.0,
                "model_params": {}
            })

    return results  # type: ignore


@router.post("/train/{dataset_id}")
async def train_ml_models(
    dataset_id: str,
    target_column: str = Query(..., description="Target column for prediction"),
    test_size: float = Query(0.2, description="Test set size (0.1-0.5)"),
    user_id: str = "anonymous",  # TODO: Get from JWT token
    _db: Any = Depends(get_database)  # pylint: disable=unused-argument
) -> JSONResponse:
    """
    Train multiple ML models on the dataset.

    Features:
    - Automatic problem type detection (classification/regression)
    - Multiple algorithm comparison
    - Cross-validation and performance metrics
    - Feature importance analysis
    - Model parameter tracking
    """
    try:
        if not (0.1 <= test_size <= 0.5):
            raise HTTPException(
                status_code=400,
                detail="Test size must be between 0.1 and 0.5"
            )

        # Get dataset metadata
        dataset = await DatasetService.get_dataset_by_id(dataset_id)
        if not dataset:
            raise HTTPException(status_code=404, detail="Dataset not found")

        # Load the dataset
        file_path = Path(dataset.storage_path)
        if not file_path.exists():
            raise HTTPException(
                status_code=404, detail="Dataset file not found"
            )

        # Read data based on file type
        if dataset.file_type.value == 'csv':  # type: ignore
            df = pd.read_csv(file_path)  # type: ignore
        else:
            df = pd.read_excel(file_path)  # type: ignore

        # Validate target column
        if target_column not in df.columns:
            raise HTTPException(
                status_code=400,
                detail=f"Target column '{target_column}' not found in dataset"
            )

        # Create analysis record
        analysis = await AnalysisService.create_analysis(
            dataset_id=dataset_id,
            user_id=user_id,
            analysis_type="ML_TRAINING",
            title=f"ML Training - {dataset.original_filename}",
            description=f"Model training with target: {target_column}"
        )

        try:
            start_time = datetime.now()

            # Prepare features and target
            (X, y, problem_type, target_encoder, # type: ignore
             categorical_cols, numerical_cols) = prepare_features(
                df, target_column
            )

            if X.empty:  # type: ignore
                raise HTTPException(
                    status_code=400,
                    detail="No numerical features available for training"
                )

            # Split the data
            stratify_param = y if problem_type == "classification" else None
            X_train, X_test, y_train, y_test = train_test_split(  # type: ignore
                X, y, test_size=test_size, random_state=42,
                stratify=stratify_param
            )

            # Train models based on problem type
            if problem_type == "classification":
                model_results = train_classification_models(
                    X_train, X_test, y_train, y_test
                )
            else:
                model_results = train_regression_models(
                    X_train, X_test, y_train, y_test
                )

            # Calculate processing time
            end_time = datetime.now()
            processing_time = (end_time - start_time).total_seconds()
            memory_used = df.memory_usage(deep=True).sum() / 1024 / 1024  # MB  # type: ignore

            # Convert to MLModelResult objects
            ml_model_results = []
            for result in model_results:
                ml_result = MLModelResult(
                    model_name=result["model_name"], # type: ignore
                    algorithm_type=result["algorithm_type"], # type: ignore
                    metrics=result["metrics"], # type: ignore
                    feature_importance=result.get("feature_importance"),
                    training_time=result["training_time"],
                    model_params=result["model_params"] # type: ignore
                )
                ml_model_results.append(ml_result) # type: ignore

            # Save results to database
            await AnalysisService.save_ml_results(
                analysis.analysis_id, # type: ignore
                ml_model_results, # type: ignore
                processing_time,
                memory_used
            )

            # Update dataset analysis count
            await DatasetService.update_analysis_count(dataset_id)

            # Log analytics
            await AnalyticsService.log_usage(
                user_id=user_id,
                action="ml_training",
                resource_id=analysis.analysis_id, # type: ignore
                execution_time=processing_time,
                memory_used=memory_used,
                metadata={
                    "dataset_id": dataset_id,
                    "target_column": target_column,
                    "problem_type": problem_type,
                    "models_trained": len(model_results),
                    "test_size": test_size
                }
            )

            # Find best model
            best_model = None
            if model_results:
                if problem_type == "classification":
                    best_model = max(
                        model_results,
                        key=lambda x: x.get("metrics", {}).get("accuracy", 0)
                    ).get("model_name", "Unknown")
                else:
                    best_model = max(
                        model_results,
                        key=lambda x: x.get("metrics", {}).get("r2_score", 0)
                    ).get("model_name", "Unknown")

            return JSONResponse(content={
                "status": "success",
                "message": "ML models trained successfully",
                "data": {
                    "analysis_id": analysis.analysis_id, # type: ignore
                    "problem_type": problem_type,
                    "dataset_info": {
                        "filename": dataset.original_filename,  # type: ignore
                        "total_rows": len(df),
                        "features_used": len(X.columns),  # type: ignore
                        "training_samples": len(X_train),  # type: ignore
                        "test_samples": len(X_test)  # type: ignore
                    },
                    "feature_info": {
                        "numerical_features": numerical_cols,
                        "categorical_features": categorical_cols,
                        "features_used_in_training": list(X.columns)  # type: ignore
                    },
                    "processing_time": round(processing_time, 2),
                    "memory_used_mb": round(memory_used, 2),
                    "model_results": model_results,
                    "best_model": best_model
                }
            })

        except Exception as e:
            # Update analysis status to failed
            await AnalysisService.update_analysis_status(
                analysis.analysis_id, # type: ignore
                AnalysisStatus.FAILED,
                str(e)
            )
            raise HTTPException(
                status_code=500, detail=f"Model training failed: {str(e)}"
            ) from e

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Internal server error: {str(e)}"
        ) from e


@router.get("/results/{analysis_id}")
async def get_ml_results(
    analysis_id: str,
    _db: Any = Depends(get_database)  # pylint: disable=unused-argument
) -> JSONResponse:
    """Retrieve ML training results by analysis ID."""
    try:
        analysis = await AnalysisService.get_analysis_by_id(analysis_id)
        if not analysis:
            raise HTTPException(status_code=404, detail="Analysis not found")

        if analysis.status != AnalysisStatus.COMPLETED:
            return JSONResponse(content={
                "status": analysis.status.value,  # type: ignore
                "message": f"Analysis is {analysis.status.value}",  # type: ignore
                "error": analysis.error_message
            })

        return JSONResponse(content={
            "status": "success",
            "data": {
                "analysis_id": analysis.analysis_id, # type: ignore
                "created_at": analysis.created_at.isoformat(),  # type: ignore
                "completed_at": analysis.completed_at.isoformat(),  # type: ignore
                "processing_time": analysis.processing_time,
                "memory_used": analysis.memory_used,
                "ml_results": [
                    result.model_dump() for result in analysis.ml_results  # type: ignore
                ] if analysis.ml_results else []
            }
        })

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to retrieve results: {str(e)}"
        ) from e


@router.get("/compare/{dataset_id}")
async def compare_models(
    dataset_id: str,
    user_id: str = "anonymous",  # TODO: Get from JWT token
    _db: Any = Depends(get_database)  # pylint: disable=unused-argument
) -> JSONResponse:
    """Compare all ML models trained on a specific dataset."""
    try:
        # Get all ML analyses for this dataset
        analyses = await AnalysisService.get_user_analyses(user_id, limit=100)
        ml_analyses = [
            a for a in analyses
            if (a.dataset_id == dataset_id and
                a.analysis_type == "ML_TRAINING" and
                a.status == AnalysisStatus.COMPLETED)
        ]

        if not ml_analyses:
            raise HTTPException(
                status_code=404,
                detail="No ML analyses found for this dataset"
            )

        # Aggregate results
        all_results = []
        for analysis in ml_analyses:
            if analysis.ml_results:
                for result in analysis.ml_results:
                    result_dict = result.model_dump()  # type: ignore
                    result_dict["analysis_id"] = analysis.analysis_id # type: ignore
                    result_dict["created_at"] = analysis.created_at.isoformat()  # type: ignore
                    all_results.append(result_dict) # type: ignore

        # Group by algorithm type
        classification_results = [ # type: ignore
            r for r in all_results if r["algorithm_type"] == "classification" # type: ignore
        ]
        regression_results = [ # type: ignore
            r for r in all_results if r["algorithm_type"] == "regression" # type: ignore
        ]

        # Find best models
        best_classification = None
        if classification_results:
            best_classification = max( # type: ignore
                classification_results, # type: ignore
                key=lambda x: x.get("metrics", {}).get("accuracy", 0) # type: ignore
            )

        best_regression = None
        if regression_results:
            best_regression = max( # type: ignore
                regression_results, # type: ignore
                key=lambda x: x.get("metrics", {}).get("r2_score", 0) # type: ignore
            )

        return JSONResponse(content={
            "status": "success",
            "data": {
                "dataset_id": dataset_id,
                "total_experiments": len(ml_analyses),
                "classification_models": classification_results,
                "regression_models": regression_results,
                "summary": {
                    "best_classification_model": best_classification,
                    "best_regression_model": best_regression
                }
            }
        })

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to compare models: {str(e)}"
        ) from e


@router.get("/health")
async def ml_health_check() -> JSONResponse:
    """Health check for ML service."""
    return JSONResponse(content={
        "status": "healthy",
        "service": "ml",
        "available_algorithms": {
            "classification": [
                "Logistic Regression", "Random Forest", "Decision Tree", "SVM"
            ],
            "regression": [
                "Linear Regression", "Random Forest", "Decision Tree", "SVR"
            ]
        },
        "supported_metrics": {
            "classification": [
                "accuracy", "precision", "recall", "f1-score", "confusion_matrix"
            ],
            "regression": ["r2_score", "mse", "rmse", "mae"]
        }
    })
