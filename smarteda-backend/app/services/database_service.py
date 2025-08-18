"""
Database service layer for SmartEDA Platform.

This module provides high-level database operations for:
- User management
- Dataset operations
- Analysis history tracking
- Model comparison experiments
"""

import hashlib
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from passlib.context import CryptContext  # type: ignore

from app.models.database import (
    AnalysisHistory,
    AnalysisStatus,
    DatasetMetadata,
    DatasetType,
    EDAResult,
    MLModelResult,
    ModelComparison,
    ModelType,
    UsageAnalytics,
    User,
)
from app.settings import get_settings

settings = get_settings()

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# =====================================================
# User Management Services
# =====================================================

class UserService:
    """Service for user management operations."""

    @staticmethod
    def hash_password(password: str) -> str:
        """Hash a password using bcrypt."""
        return pwd_context.hash(password)

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash."""
        return pwd_context.verify(plain_password, hashed_password)

    @staticmethod
    async def create_user(
        email: str,
        username: str,
        password: str,
        full_name: Optional[str] = None
    ) -> User:
        """Create a new user."""
        hashed_password = UserService.hash_password(password)

        user = User(
            email=email,
            username=username,
            hashed_password=hashed_password,
            full_name=full_name
        )

        await user.insert()  # type: ignore
        return user

    @staticmethod
    async def get_user_by_email(email: str) -> Optional[User]:
        """Get user by email address."""
        return await User.find_one(User.email == email)  # type: ignore

    @staticmethod
    async def get_user_by_username(username: str) -> Optional[User]:
        """Get user by username."""
        return await User.find_one(User.username == username)  # type: ignore
    
    @staticmethod
    async def get_user_by_id(user_id: str) -> Optional[User]:
        """Get user by ID."""
        try:
            return await User.get(user_id)  # type: ignore
        except (ValueError, TypeError, AttributeError):
            return None
    
    @staticmethod
    async def authenticate_user(email: str, password: str) -> Optional[User]:
        """Authenticate user with email and password."""
        user = await UserService.get_user_by_email(email)
        if not user or not UserService.verify_password(password, user.hashed_password):
            return None
        return user

    @staticmethod
    async def update_last_login(user: User) -> None:
        """Update user's last login timestamp."""
        user.last_login = datetime.now(timezone.utc)
        await user.save()  # type: ignore


# =====================================================
# Dataset Management Services
# =====================================================

class DatasetService:
    """Service for dataset operations."""

    @staticmethod
    def calculate_file_checksum(file_path: str) -> str:
        """Calculate MD5 checksum of a file."""
        hash_md5 = hashlib.md5()
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_md5.update(chunk)
        return hash_md5.hexdigest()
    
    @staticmethod
    async def create_dataset_metadata(
        filename: str,
        original_filename: str,
        file_type: DatasetType,
        file_size: int,
        user_id: str,
        storage_path: str,
        num_rows: int,
        num_columns: int,
        column_names: List[str],
        column_types: Dict[str, str],
        memory_usage: float,
        missing_values_total: int,
        missing_values_percentage: float,
        duplicate_rows: int
    ) -> DatasetMetadata:
        """Create dataset metadata record."""
        checksum = DatasetService.calculate_file_checksum(storage_path)

        dataset = DatasetMetadata(
            filename=filename,
            original_filename=original_filename,
            file_type=file_type,
            file_size=file_size,
            uploaded_by=user_id,
            num_rows=num_rows,
            num_columns=num_columns,
            column_names=column_names,
            column_types=column_types,
            memory_usage=memory_usage,
            missing_values_total=missing_values_total,
            missing_values_percentage=missing_values_percentage,
            duplicate_rows=duplicate_rows,
            storage_path=storage_path,
            checksum=checksum
        )

        await dataset.insert()  # type: ignore
        return dataset
    
    @staticmethod
    async def get_user_datasets(user_id: str, limit: int = 50) -> List[DatasetMetadata]:
        """Get datasets uploaded by a specific user."""
        return await DatasetMetadata.find(  # type: ignore
            DatasetMetadata.uploaded_by == user_id
        ).sort("-uploaded_at").limit(limit).to_list()
    
    @staticmethod
    async def get_dataset_by_id(dataset_id: str) -> Optional[DatasetMetadata]:
        """Get dataset by ID."""
        try:
            return await DatasetMetadata.get(dataset_id)  # type: ignore
        except (ValueError, TypeError, AttributeError):
            return None
    
    @staticmethod
    async def update_analysis_count(dataset_id: str) -> None:
        """Increment analysis count for a dataset."""
        dataset = await DatasetService.get_dataset_by_id(dataset_id)
        if dataset:
            dataset.total_analyses += 1
            dataset.last_analyzed = datetime.now(timezone.utc)
            await dataset.save()  # type: ignore

    @staticmethod
    async def get_dataset_statistics() -> Dict[str, Any]:
        """Get overall dataset statistics."""
        total_datasets = await DatasetMetadata.count()  # type: ignore
        total_size = await DatasetMetadata.aggregate([  # type: ignore
            {"$group": {"_id": None, "total_size": {"$sum": "$file_size"}}}
        ]).to_list(1)

        file_types = await DatasetMetadata.aggregate([  # type: ignore
            {"$group": {"_id": "$file_type", "count": {"$sum": 1}}}
        ]).to_list(None)

        return {
            "total_datasets": total_datasets,
            "total_size_bytes": total_size[0]["total_size"] if total_size else 0,
            "file_types": {item["_id"]: item["count"] for item in file_types}
        }


# =====================================================
# Analysis History Services
# =====================================================

class AnalysisService:
    """Service for analysis operations."""

    @staticmethod
    def generate_analysis_id() -> str:
        """Generate unique analysis ID."""
        return f"analysis_{uuid.uuid4().hex[:12]}"

    @staticmethod
    async def create_analysis(
        dataset_id: str,
        user_id: str,
        analysis_type: str,
        title: Optional[str] = None,
        description: Optional[str] = None
    ) -> AnalysisHistory:
        """Create a new analysis record."""
        analysis = AnalysisHistory(
            analysis_id=AnalysisService.generate_analysis_id(),
            dataset_id=dataset_id,
            user_id=user_id,
            analysis_type=analysis_type,
            title=title,
            description=description
        )

        await analysis.insert()  # type: ignore
        return analysis
    
    @staticmethod
    async def update_analysis_status(
        analysis_id: str,
        status: AnalysisStatus,
        error_message: Optional[str] = None
    ) -> None:
        """Update analysis status."""
        analysis = await AnalysisHistory.find_one(  # type: ignore
            AnalysisHistory.analysis_id == analysis_id  # type: ignore
        )
        if analysis:
            analysis.status = status
            if error_message:
                analysis.error_message = error_message
            if status == AnalysisStatus.COMPLETED:
                analysis.completed_at = datetime.now(timezone.utc)
            await analysis.save()  # type: ignore

    @staticmethod
    async def save_eda_results(
        analysis_id: str,
        eda_results: EDAResult,
        processing_time: float,
        memory_used: float
    ) -> None:
        """Save EDA analysis results."""
        analysis = await AnalysisHistory.find_one(  # type: ignore
            AnalysisHistory.analysis_id == analysis_id  # type: ignore
        )
        if analysis:
            analysis.eda_results = eda_results
            analysis.processing_time = processing_time
            analysis.memory_used = memory_used
            analysis.status = AnalysisStatus.COMPLETED
            analysis.completed_at = datetime.now(timezone.utc)
            await analysis.save()  # type: ignore
    
    @staticmethod
    async def save_ml_results(
        analysis_id: str,
        ml_results: List[MLModelResult],
        processing_time: float,
        memory_used: float
    ) -> None:
        """Save ML analysis results."""
        analysis = await AnalysisHistory.find_one(  # type: ignore
            AnalysisHistory.analysis_id == analysis_id  # type: ignore
        )
        if analysis:
            analysis.ml_results = ml_results
            analysis.processing_time = processing_time
            analysis.memory_used = memory_used
            analysis.status = AnalysisStatus.COMPLETED
            analysis.completed_at = datetime.now(timezone.utc)
            await analysis.save()  # type: ignore

    @staticmethod
    async def get_user_analyses(
        user_id: str,
        limit: int = 50,
        status: Optional[AnalysisStatus] = None
    ) -> List[AnalysisHistory]:
        """Get user's analysis history."""
        query = AnalysisHistory.user_id == user_id
        if status:
            query = query & (AnalysisHistory.status == status)

        return await AnalysisHistory.find(query).sort(  # type: ignore
            "-created_at"
        ).limit(limit).to_list()

    @staticmethod
    async def get_analysis_by_id(analysis_id: str) -> Optional[AnalysisHistory]:
        """Get analysis by ID."""
        return await AnalysisHistory.find_one(  # type: ignore
            AnalysisHistory.analysis_id == analysis_id  # type: ignore
        )


# =====================================================
# Model Comparison Services
# =====================================================

class ModelComparisonService:
    """Service for model comparison experiments."""

    @staticmethod
    def generate_experiment_id() -> str:
        """Generate unique experiment ID."""
        return f"exp_{uuid.uuid4().hex[:12]}"

    @staticmethod
    async def create_comparison(
        dataset_id: str,
        user_id: str,
        target_column: str,
        problem_type: ModelType,
        models_compared: List[str],
        title: str,
        description: Optional[str] = None
    ) -> ModelComparison:
        """Create a new model comparison experiment."""
        comparison = ModelComparison(
            experiment_id=ModelComparisonService.generate_experiment_id(),
            dataset_id=dataset_id,
            user_id=user_id,
            target_column=target_column,
            problem_type=problem_type,
            models_compared=models_compared,
            title=title,
            description=description,
            model_results=[],
            best_model="",
            comparison_metrics={}
        )

        await comparison.insert()  # type: ignore
        return comparison

    @staticmethod
    async def save_comparison_results(
        experiment_id: str,
        model_results: List[MLModelResult],
        best_model: str,
        comparison_metrics: Dict[str, Dict[str, float]]
    ) -> None:
        """Save model comparison results."""
        comparison = await ModelComparison.find_one(  # type: ignore
            ModelComparison.experiment_id == experiment_id  # type: ignore
        )
        if comparison:
            comparison.model_results = model_results
            comparison.best_model = best_model
            comparison.comparison_metrics = comparison_metrics
            await comparison.save()  # type: ignore
    
    @staticmethod
    async def get_user_comparisons(user_id: str, limit: int = 20) -> List[ModelComparison]:
        """Get user's model comparison experiments."""
        return await ModelComparison.find(  # type: ignore
            ModelComparison.user_id == user_id
        ).sort("-created_at").limit(limit).to_list()  # type: ignore


# =====================================================
# Analytics Services
# =====================================================

class AnalyticsService:
    """Service for usage analytics."""

    @staticmethod
    async def log_usage(
        user_id: str,
        action: str,
        resource_id: str,
        execution_time: Optional[float] = None,
        memory_used: Optional[float] = None,
        file_size: Optional[int] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> None:
        """Log user action for analytics."""
        analytics = UsageAnalytics(
            user_id=user_id,
            action=action,
            resource_id=resource_id,
            execution_time=execution_time,
            memory_used=memory_used,
            file_size=file_size,
            metadata=metadata or {}
        )

        await analytics.insert()  # type: ignore

    @staticmethod
    async def get_user_analytics(
        user_id: str,
        days: int = 30
    ) -> Dict[str, Any]:
        """Get user analytics for the past N days."""
        from datetime import timedelta

        start_date = datetime.now(timezone.utc) - timedelta(days=days)

        # Action counts
        action_counts = await UsageAnalytics.aggregate([  # type: ignore
            {"$match": {
                "user_id": user_id,
                "timestamp": {"$gte": start_date}
            }},
            {"$group": {"_id": "$action", "count": {"$sum": 1}}}
        ]).to_list(None)

        # Total usage time
        total_time = await UsageAnalytics.aggregate([  # type: ignore
            {"$match": {
                "user_id": user_id,
                "timestamp": {"$gte": start_date},
                "execution_time": {"$ne": None}
            }},
            {"$group": {"_id": None, "total_time": {"$sum": "$execution_time"}}}
        ]).to_list(1)

        return {
            "action_counts": {item["_id"]: item["count"] for item in action_counts},  # type: ignore
            "total_execution_time": total_time[0]["total_time"] if total_time else 0,
            "period_days": days
        }
