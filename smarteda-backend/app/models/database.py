"""
Database models for SmartEDA Platform using Beanie ODM for MongoDB.

This module defines all database models for storing:
- User information and sessions
- Dataset metadata and analysis history
- ML model results and comparisons
- System configurations
"""

from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional

from beanie import Document, Indexed  # type: ignore
from pydantic import BaseModel, Field


def utc_now() -> datetime:
    """Get current UTC datetime with timezone info."""
    return datetime.now(timezone.utc)


class AnalysisStatus(str, Enum):
    """Status enumeration for analysis tasks."""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class ModelType(str, Enum):
    """Machine learning model types."""
    CLASSIFICATION = "classification"
    REGRESSION = "regression"


class DatasetType(str, Enum):
    """Dataset file types."""
    CSV = "csv"
    EXCEL = "excel"
    JSON = "json"


# =====================================================
# User Management Models
# =====================================================

class User(Document):  # type: ignore
    """User model for authentication and session management."""

    email: Indexed(str, unique=True)  # type: ignore
    username: Indexed(str, unique=True)  # type: ignore
    hashed_password: str
    full_name: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=utc_now)
    last_login: Optional[datetime] = None

    class Settings:
        name = "users"


class UserSession(Document):  # type: ignore
    """User session tracking."""

    user_id: str
    session_token: str
    expires_at: datetime
    created_at: datetime = Field(default_factory=utc_now)
    is_active: bool = True

    class Settings:
        name = "user_sessions"


# =====================================================
# Dataset Management Models
# =====================================================

class DatasetMetadata(Document):  # type: ignore
    """Metadata for uploaded datasets."""

    filename: str
    original_filename: str
    file_type: DatasetType
    file_size: int  # in bytes
    uploaded_by: str  # user_id
    uploaded_at: datetime = Field(default_factory=utc_now)

    # Dataset characteristics
    num_rows: int
    num_columns: int
    column_names: List[str]
    column_types: Dict[str, str]
    memory_usage: float  # in MB

    # Data quality metrics
    missing_values_total: int
    missing_values_percentage: float
    duplicate_rows: int

    # File storage information
    storage_path: str
    checksum: str  # for integrity verification

    # Analysis metadata
    total_analyses: int = 0
    last_analyzed: Optional[datetime] = None

    class Settings:
        name = "datasets"


# =====================================================
# Analysis History Models
# =====================================================

class EDAResult(BaseModel):
    """Results from exploratory data analysis."""

    # Statistical summary
    statistical_summary: Dict[str, Any]

    # Missing value analysis
    missing_values: Dict[str, Any]

    # Correlation analysis
    correlations: Dict[str, Any]

    # Outlier detection
    outliers: Dict[str, Any]

    # Data type analysis
    data_types: Dict[str, str]

    # Visualizations (base64 encoded)
    visualizations: Dict[str, str]

    # Target variable analysis (if specified)
    target_analysis: Optional[Dict[str, Any]] = None


class MLModelResult(BaseModel):
    """Results from machine learning model training."""

    model_type: ModelType
    algorithm_name: str

    # Training configuration
    target_column: str
    feature_columns: List[str]
    train_test_split: float
    hyperparameters: Dict[str, Any]

    # Performance metrics
    training_metrics: Dict[str, float]
    validation_metrics: Dict[str, float]

    # Feature importance (for tree-based models)
    feature_importance: Optional[Dict[str, float]] = None

    # Model artifacts
    model_size: int  # serialized model size in bytes
    training_time: float  # seconds

    # Predictions sample
    predictions_sample: List[Any]


class AnalysisHistory(Document):  # type: ignore
    """Complete analysis session history."""

    # Basic information
    analysis_id: Indexed(str, unique=True)  # type: ignore
    dataset_id: str  # References DatasetMetadata
    user_id: str  # References User
    created_at: datetime = Field(default_factory=utc_now)
    completed_at: Optional[datetime] = None

    # Analysis configuration
    analysis_type: str  # "eda", "ml", "combined"
    status: AnalysisStatus = AnalysisStatus.PENDING

    # Results
    eda_results: Optional[EDAResult] = None
    ml_results: Optional[List[MLModelResult]] = None

    # Performance tracking
    processing_time: Optional[float] = None  # seconds
    memory_used: Optional[float] = None  # MB

    # Error handling
    error_message: Optional[str] = None
    error_traceback: Optional[str] = None

    # User annotations
    title: Optional[str] = None
    description: Optional[str] = None
    tags: List[str] = Field(default_factory=list)

    class Settings:
        name = "analysis_history"


# =====================================================
# Model Comparison & Experiments
# =====================================================

class ModelComparison(Document):  # type: ignore
    """Model comparison experiments."""

    experiment_id: Indexed(str, unique=True)  # type: ignore
    dataset_id: str
    user_id: str
    created_at: datetime = Field(default_factory=utc_now)

    # Experiment configuration
    target_column: str
    problem_type: ModelType
    models_compared: List[str]  # algorithm names

    # Results
    model_results: List[MLModelResult]
    best_model: str  # algorithm name with best performance
    comparison_metrics: Dict[str, Dict[str, float]]

    # Experiment metadata
    title: str
    description: Optional[str] = None
    is_favorite: bool = False

    class Settings:
        name = "model_comparisons"


# =====================================================
# System Configuration Models
# =====================================================

class SystemConfig(Document):  # type: ignore
    """System-wide configuration settings."""

    config_key: Indexed(str, unique=True)  # type: ignore
    config_value: Any
    description: str
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)
    updated_by: str  # user_id

    class Settings:
        name = "system_config"


# =====================================================
# Analytics & Monitoring Models
# =====================================================

class UsageAnalytics(Document):  # type: ignore
    """Platform usage analytics."""

    user_id: str
    # "upload", "eda", "ml_train", "download_report"
    action: str
    resource_id: str  # dataset_id or analysis_id
    timestamp: datetime = Field(default_factory=utc_now)

    # Performance metrics
    execution_time: Optional[float] = None
    memory_used: Optional[float] = None
    file_size: Optional[int] = None

    # Additional metadata
    metadata: Dict[str, Any] = Field(default_factory=dict)

    class Settings:
        name = "usage_analytics"


# Export all models for easy importing
__all__ = [
    "User",
    "UserSession",
    "DatasetMetadata",
    "EDAResult",
    "MLModelResult",
    "AnalysisHistory",
    "ModelComparison",
    "SystemConfig",
    "UsageAnalytics",
    "AnalysisStatus",
    "ModelType",
    "DatasetType"
]
