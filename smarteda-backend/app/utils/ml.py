"""ML utilities for SmartEDA Data Science Platform.

Provides functions for training machine learning models.
"""

from typing import Dict, Any

import pandas as pd
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.linear_model import LogisticRegression, LinearRegression
from sklearn.model_selection import train_test_split  # type: ignore
from sklearn.metrics import (  # type: ignore
    accuracy_score, precision_score, recall_score, f1_score,
    mean_squared_error, mean_absolute_error, r2_score
)


def train_model(
    df: pd.DataFrame,
    target_column: str,
    problem_type: str = "classification",
    test_size: float = 0.2,
    model_type: str = "auto"
) -> Dict[str, Any]:
    """Train a machine learning model on the provided DataFrame.
    
    Args:
        df: Input DataFrame
        target_column: Name of the target column
        problem_type: Either "classification" or "regression"
        test_size: Proportion of data to use for testing
        model_type: Type of model to train ("auto", "random_forest", "linear")
    
    Returns:
        Dictionary containing model performance metrics and predictions
    """
    # Prepare features and target
    X = df.drop(columns=[target_column])
    y = df[target_column]
    
    # Handle categorical variables (simple encoding)
    X_encoded = pd.get_dummies(X, drop_first=True)
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(  # type: ignore
        X_encoded, y, test_size=test_size, random_state=42
    )
    
    # Select model
    if model_type == "auto":
        if problem_type == "classification":
            model = RandomForestClassifier(n_estimators=100, random_state=42)
        else:
            model = RandomForestRegressor(n_estimators=100, random_state=42)
    elif model_type == "random_forest":
        if problem_type == "classification":
            model = RandomForestClassifier(n_estimators=100, random_state=42)
        else:
            model = RandomForestRegressor(n_estimators=100, random_state=42)
    elif model_type == "linear":
        if problem_type == "classification":
            model = LogisticRegression(random_state=42, max_iter=1000)
        else:
            model = LinearRegression()
    else:
        raise ValueError(f"Unsupported model_type: {model_type}")
    
    # Train model
    model.fit(X_train, y_train)  # type: ignore
    
    # Make predictions
    y_pred = model.predict(X_test)  # type: ignore
    
    # Calculate metrics
    if problem_type == "classification":
        metrics = {
            "accuracy": float(accuracy_score(y_test, y_pred)),  # type: ignore
            "precision": float(precision_score(y_test, y_pred, average='weighted')),  # type: ignore
            "recall": float(recall_score(y_test, y_pred, average='weighted')),  # type: ignore
            "f1_score": float(f1_score(y_test, y_pred, average='weighted'))  # type: ignore
        }
    else:
        metrics = {
            "mse": float(mean_squared_error(y_test, y_pred)),  # type: ignore
            "mae": float(mean_absolute_error(y_test, y_pred)),  # type: ignore
            "r2_score": float(r2_score(y_test, y_pred))  # type: ignore
        }
    
    # Feature importance (if available)
    feature_importance = {}
    if hasattr(model, 'feature_importances_'):
        feature_names = X_encoded.columns.tolist()
        importance_values = model.feature_importances_.tolist()  # type: ignore
        feature_importance = dict(zip(feature_names, importance_values))  # type: ignore
    
    return {
        "model_type": model_type,
        "problem_type": problem_type,
        "metrics": metrics,
        "feature_importance": feature_importance,
        "predictions": y_pred.tolist(),
        "test_size": test_size,
        "n_features": len(X_encoded.columns),
        "n_samples": len(df)
    }
