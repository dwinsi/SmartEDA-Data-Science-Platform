"""
ML Tasks for asynchronous processing.

Handles:
- Model training
- Hyperparameter tuning
- Model evaluation
- Prediction batch processing
"""

import logging
from typing import Dict, Any
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, GridSearchCV # type: ignore
from sklearn.metrics import classification_report, mean_squared_error, r2_score # type: ignore
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from celery import current_task # type: ignore

from app.celery_app import celery_app

logger = logging.getLogger(__name__)


@celery_app.task(bind=True, name="train_model_async")  # type: ignore
def train_model_async(self, dataset_id: str, file_path: str, target_column: str, # type: ignore
                      model_type: str = "auto", test_size: float = 0.2) -> Dict[str, Any]:
    """
    Asynchronous model training task.

    Args:
        dataset_id: Unique dataset identifier
        file_path: Path to the dataset file
        target_column: Name of the target column
        model_type: Type of model to train (auto, classification, regression)
        test_size: Proportion of data for testing

    Returns:
        Dict containing training results and model metrics
    """
    try:
        # Update task status
        current_task.update_state(
            state='PROGRESS',
            meta={'current': 10, 'total': 100, 'status': 'Loading dataset...'}
        )  # type: ignore

        # Load dataset
        df = pd.read_csv(file_path)  # type: ignore
        logger.info(f"Loaded dataset {dataset_id} with shape {df.shape}")

        # Validate target column
        if target_column not in df.columns:
            raise ValueError(f"Target column '{target_column}' not found in dataset")

        current_task.update_state(
            state='PROGRESS',
            meta={'current': 30, 'total': 100, 'status': 'Preparing data...'}
        )  # type: ignore

        # Prepare data
        X = df.drop(columns=[target_column])
        y = df[target_column]

        # Handle categorical variables (basic preprocessing)
        X_numeric = X.select_dtypes(include=[np.number])

        # Split data
        X_train, X_test, y_train, y_test = train_test_split(  # type: ignore
            X_numeric, y, test_size=test_size, random_state=42
        )

        current_task.update_state(
            state='PROGRESS',
            meta={'current': 60, 'total': 100, 'status': 'Training model...'}
        )  # type: ignore

        # Determine problem type and train model
        if model_type == "auto":
            # Auto-detect problem type
            unique_values = len(y.unique())
            if unique_values <= 10 and y.dtype in ['object', 'bool']:
                problem_type = "classification"
            else:
                problem_type = "regression"
        else:
            problem_type = model_type

        # Train appropriate model
        if problem_type == "classification":
            model = RandomForestClassifier(n_estimators=100, random_state=42)
            model.fit(X_train, y_train)  # type: ignore

            # Predictions and metrics
            y_pred = model.predict(X_test)  # type: ignore
            metrics = {  # type: ignore
                "classification_report": classification_report(y_test, y_pred, output_dict=True),  # type: ignore
                "accuracy": model.score(X_test, y_test)  # type: ignore
            }
        else:
            model = RandomForestRegressor(n_estimators=100, random_state=42)
            model.fit(X_train, y_train) # type: ignore

            # Predictions and metrics
            y_pred = model.predict(X_test) # type: ignore
            metrics = { # type: ignore
                "mse": mean_squared_error(y_test, y_pred), # type: ignore
                "rmse": np.sqrt(mean_squared_error(y_test, y_pred)), # type: ignore
                "r2": r2_score(y_test, y_pred) # type: ignore
            }

        current_task.update_state(
            state='PROGRESS',
            meta={'current': 90, 'total': 100, 'status': 'Saving model...'}
        ) # type: ignore

        # Feature importance
        feature_importance = dict(zip(X_numeric.columns, model.feature_importances_))

        current_task.update_state(
            state='SUCCESS',
            meta={'current': 100, 'total': 100, 'status': 'Training complete!'}
        ) # type: ignore

        return {
            'dataset_id': dataset_id,
            'status': 'completed',
            'problem_type': problem_type,
            'metrics': metrics,
            'feature_importance': feature_importance,
            'training_shape': X_train.shape, # type: ignore
            'test_shape': X_test.shape # type: ignore
        }

    except Exception as exc:
        logger.error(f"Model training failed for dataset {dataset_id}: {str(exc)}")
        current_task.update_state(
            state='FAILURE',
            meta={
                'current': 100,
                'total': 100,
                'status': f'Training failed: {str(exc)}'
            }
        ) # type: ignore
        raise exc


@celery_app.task(bind=True, name="hyperparameter_tuning_async") # type: ignore
def hyperparameter_tuning_async(self, dataset_id: str, file_path: str, # type: ignore
                                target_column: str, model_type: str = "auto") -> Dict[str, Any]:
    """
    Perform hyperparameter tuning asynchronously.

    This is a computationally expensive task that benefits from async processing.
    """
    try:
        current_task.update_state(
            state='PROGRESS',
            meta={'current': 20, 'total': 100, 'status': 'Setting up hyperparameter search...'}
        ) # type: ignore

        # Load and prepare data (similar to train_model_async)
        df = pd.read_csv(file_path) # type: ignore
        X = df.drop(columns=[target_column])
        y = df[target_column]
        X_numeric = X.select_dtypes(include=[np.number])

        current_task.update_state(
            state='PROGRESS',
            meta={'current': 40, 'total': 100, 'status': 'Running grid search...'}
        ) # type: ignore

        # Define parameter grids and perform grid search
        if model_type == "classification" or len(y.unique()) <= 10:
            model = RandomForestClassifier(random_state=42)
            param_grid = { # type: ignore
                'n_estimators': [50, 100, 200],
                'max_depth': [None, 10, 20],
                'min_samples_split': [2, 5, 10]
            }
        else:
            model = RandomForestRegressor(random_state=42)
            param_grid = { # type: ignore
                'n_estimators': [50, 100, 200],
                'max_depth': [None, 10, 20],
                'min_samples_split': [2, 5, 10]
            }

        # Perform grid search
        scoring = 'accuracy' if model_type == "classification" else 'r2'
        grid_search = GridSearchCV(model, param_grid, cv=3, scoring=scoring)
        grid_search.fit(X_numeric, y) # type: ignore

        current_task.update_state(
            state='SUCCESS',
            meta={'current': 100, 'total': 100, 'status': 'Hyperparameter tuning complete!'}
        ) # type: ignore

        return {
            'dataset_id': dataset_id,
            'status': 'completed',
            'best_params': grid_search.best_params_, # type: ignore
            'best_score': grid_search.best_score_,
            'cv_results': {
                'mean_test_score': grid_search.cv_results_['mean_test_score'].tolist(),
                'params': grid_search.cv_results_['params']
            }
        }

    except Exception as exc:
        logger.error(f"Hyperparameter tuning failed for dataset {dataset_id}: {str(exc)}")
        raise exc
