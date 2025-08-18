"""
EDA (Exploratory Data Analysis) routes for SmartEDA Platform.

Provides comprehensive statistical analysis, visualizations, and data insights.
Supports automated EDA generation with customizable analysis options.
"""

# type: ignore[import-untyped]
import base64
import io
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, Optional

import matplotlib  # type: ignore[import-untyped]
import matplotlib.pyplot as plt  # type: ignore[import-untyped]
import numpy as np  # type: ignore[import-untyped]
import pandas as pd  # type: ignore[import-untyped]
import seaborn as sns  # type: ignore[import-untyped]
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import JSONResponse

from app.database.connection import get_database
from app.models.database import AnalysisStatus, EDAResult
from app.services.database_service import (
    AnalysisService,
    DatasetService,
    AnalyticsService
)

# Set matplotlib to use non-interactive backend
matplotlib.use('Agg')
plt.style.use('seaborn-v0_8')
sns.set_palette("husl")

router = APIRouter()


def plot_to_base64(fig: Any) -> str:
    """Convert matplotlib figure to base64 encoded string."""
    buffer = io.BytesIO()
    fig.savefig(buffer, format='png', dpi=150, bbox_inches='tight')
    buffer.seek(0)
    image_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
    plt.close(fig)
    return image_base64


def generate_statistical_summary(df: pd.DataFrame) -> Dict[str, Any]:
    """Generate comprehensive statistical summary."""
    summary = { # type: ignore
        "basic_info": {
            "rows": len(df),
            "columns": len(df.columns),
            "memory_usage_mb": df.memory_usage(deep=True).sum() / 1024 / 1024,
            "dtypes": df.dtypes.astype(str).to_dict()  # type: ignore[misc]
        },
        "missing_values": {
            "total": df.isnull().sum().to_dict(),  # type: ignore[misc]
            "percentage": (
                df.isnull().sum() / len(df) * 100
            ).round(2).to_dict()  # type: ignore[misc]
        },
        "duplicates": {
            "count": df.duplicated().sum(),
            "percentage": round(df.duplicated().sum() / len(df) * 100, 2)
        },
        "numerical_summary": {},
        "categorical_summary": {}
    }

    # Numerical columns analysis
    numerical_cols = df.select_dtypes(include=[np.number]).columns
    if len(numerical_cols) > 0:
        summary["numerical_summary"] = (
            df[numerical_cols].describe().to_dict()  # type: ignore[misc]
        )

        # Add skewness and kurtosis
        for col in numerical_cols:
            if col in summary["numerical_summary"]:
                summary["numerical_summary"][col]["skewness"] = (
                    float(df[col].skew())  # type: ignore[arg-type]
                )
                summary["numerical_summary"][col]["kurtosis"] = (
                    float(df[col].kurtosis())  # type: ignore[arg-type]
                )

    # Categorical columns analysis
    categorical_cols = df.select_dtypes(include=['object', 'category']).columns
    if len(categorical_cols) > 0:
        for col in categorical_cols:
            summary["categorical_summary"][col] = {
                "unique_count": df[col].nunique(),
                "top_values": (
                    df[col].value_counts().head(10).to_dict()  # type: ignore[misc]
                ),
                "null_count": df[col].isnull().sum()
            }

    return summary  # type: ignore


def generate_correlation_analysis(df: pd.DataFrame) -> Dict[str, Any]:
    """Generate correlation analysis for numerical columns."""
    numerical_cols = df.select_dtypes(include=[np.number]).columns

    if len(numerical_cols) < 2:
        return {
            "message": "Insufficient numerical columns for correlation analysis"
        }

    correlation_matrix = df[numerical_cols].corr()

    # Find highly correlated pairs
    high_corr_pairs = []
    for i in range(len(correlation_matrix.columns)):
        for j in range(i + 1, len(correlation_matrix.columns)):
            corr_value = correlation_matrix.iloc[i, j]
            # High correlation threshold
            if abs(corr_value) > 0.7:  # type: ignore[operator]
                high_corr_pairs.append({  # type: ignore[misc]
                    "feature1": correlation_matrix.columns[i],
                    "feature2": correlation_matrix.columns[j],
                    "correlation": round(
                        float(corr_value), 3  # type: ignore[arg-type]
                    )
                })

    return {
        "correlation_matrix": (
            correlation_matrix.round(3).to_dict()  # type: ignore[misc]
        ),
        "high_correlations": high_corr_pairs,
        "numerical_features": list(numerical_cols)
    }


def generate_visualizations(df: pd.DataFrame) -> Dict[str, str]:
    """Generate key visualizations as base64 encoded images."""
    visualizations = {}

    # 1. Missing values heatmap
    if df.isnull().sum().sum() > 0:
        fig, ax = plt.subplots(figsize=(12, 8))  # type: ignore[misc]
        sns.heatmap(  # type: ignore[misc]
            df.isnull(), yticklabels=False, cbar=True, cmap='viridis', ax=ax
        )
        ax.set_title(  # type: ignore[misc]
            'Missing Values Heatmap', fontsize=16, pad=20
        )
        visualizations["missing_values_heatmap"] = plot_to_base64(fig)

    # 2. Correlation heatmap
    numerical_cols = df.select_dtypes(include=[np.number]).columns
    if len(numerical_cols) > 1:
        fig, ax = plt.subplots(figsize=(12, 10))  # type: ignore[misc]
        correlation_matrix = df[numerical_cols].corr()
        sns.heatmap(  # type: ignore[misc]
            correlation_matrix, annot=True, cmap='coolwarm',
            center=0, square=True, ax=ax, fmt='.2f'
        )
        ax.set_title(  # type: ignore[misc]
            'Feature Correlation Matrix', fontsize=16, pad=20
        )
        visualizations["correlation_heatmap"] = plot_to_base64(fig)

    # 3. Distribution plots for numerical features
    if len(numerical_cols) > 0:
        n_cols = min(3, len(numerical_cols))
        n_rows = (len(numerical_cols) + n_cols - 1) // n_cols
        fig, axes = plt.subplots(  # type: ignore[misc]
            n_rows, n_cols, figsize=(15, 5 * n_rows)
        )
        axes = (axes.flatten() if n_rows > 1 else
                [axes] if n_rows == 1 else axes)

        for i, col in enumerate(numerical_cols[:9]):  # Limit to 9 plots
            if i < len(axes):
                df[col].hist(  # type: ignore[misc]
                    bins=30, ax=axes[i], alpha=0.7,
                    color='skyblue', edgecolor='black'
                )
                axes[i].set_title(f'Distribution of {col}', fontsize=12)
                axes[i].set_xlabel(col)
                axes[i].set_ylabel('Frequency')

        # Hide empty subplots
        for i in range(len(numerical_cols), len(axes)):
            axes[i].set_visible(False)

        plt.tight_layout()
        visualizations["distributions"] = plot_to_base64(fig)

    # 4. Box plots for outlier detection
    if len(numerical_cols) > 0:
        n_cols = min(3, len(numerical_cols))
        n_rows = (len(numerical_cols) + n_cols - 1) // n_cols
        fig, axes = plt.subplots(  # type: ignore[misc]
            n_rows, n_cols, figsize=(15, 5 * n_rows)
        )
        axes = (axes.flatten() if n_rows > 1 else
                [axes] if n_rows == 1 else axes)

        for i, col in enumerate(numerical_cols[:9]):
            if i < len(axes):
                df.boxplot(column=col, ax=axes[i])  # type: ignore[misc]
                axes[i].set_title(f'Outliers in {col}', fontsize=12)

        for i in range(len(numerical_cols), len(axes)):
            axes[i].set_visible(False)

        plt.tight_layout()
        visualizations["outliers"] = plot_to_base64(fig)

    # 5. Categorical value counts
    categorical_cols = df.select_dtypes(include=['object', 'category']).columns
    if len(categorical_cols) > 0:
        n_cols = min(2, len(categorical_cols))
        n_rows = (len(categorical_cols) + n_cols - 1) // n_cols
        fig, axes = plt.subplots(  # type: ignore[misc]
            n_rows, n_cols, figsize=(15, 6 * n_rows)
        )
        axes = (axes.flatten() if n_rows > 1 else
                [axes] if n_rows == 1 else axes)

        for i, col in enumerate(categorical_cols[:6]):  # Limit to 6 plots
            if i < len(axes):
                top_values = df[col].value_counts().head(10)
                top_values.plot(kind='bar', ax=axes[i], color='lightcoral')
                axes[i].set_title(f'Top Values in {col}', fontsize=12)
                axes[i].set_xlabel(col)
                axes[i].set_ylabel('Count')
                axes[i].tick_params(axis='x', rotation=45)

        for i in range(len(categorical_cols), len(axes)):
            axes[i].set_visible(False)

        plt.tight_layout()
        visualizations["categorical_counts"] = plot_to_base64(fig)

    return visualizations # type: ignore


@router.post("/analyze/{dataset_id}")
async def run_eda_analysis(
    dataset_id: str,
    user_id: str = "anonymous",  # NOTE: Get from JWT token in production
    include_visualizations: bool = Query(
        True, description="Include generated visualizations"
    ),
    target_column: Optional[str] = Query(
        None, description="Target column for supervised analysis"
    ),
    # pylint: disable=unused-argument
    db: Any = Depends(get_database)
) -> JSONResponse:
    """
    Run comprehensive EDA analysis on uploaded dataset.

    Features:
    - Statistical summaries and data profiling
    - Missing value analysis
    - Correlation analysis
    - Outlier detection
    - Automated visualizations
    - Target column analysis for ML preparation
    """
    try:
        # Get dataset metadata
        dataset = await DatasetService.get_dataset_by_id(dataset_id)
        if not dataset:
            raise HTTPException(status_code=404, detail="Dataset not found")

        # Create analysis record
        analysis = await AnalysisService.create_analysis(
            dataset_id=dataset_id,
            user_id=user_id,
            analysis_type="EDA",
            title=f"EDA Analysis - {dataset.original_filename}",
            description="Automated exploratory data analysis"
        )

        try:
            # Load the dataset
            file_path = Path(dataset.storage_path)
            if not file_path.exists():
                raise HTTPException(
                    status_code=404, detail="Dataset file not found"
                )

            # Read data based on file type
            if dataset.file_type.value == 'csv':
                df = pd.read_csv(file_path)  # type: ignore[misc]
            else:
                df = pd.read_excel(file_path)  # type: ignore[misc]

            start_time = datetime.now()

            # Generate statistical summary
            statistical_summary = generate_statistical_summary(df)

            # Generate correlation analysis
            correlation_analysis = generate_correlation_analysis(df)

            # Generate outlier analysis
            outlier_analysis = {}
            numerical_cols = df.select_dtypes(include=[np.number]).columns
            for col in numerical_cols:
                Q1 = df[col].quantile(0.25)
                Q3 = df[col].quantile(0.75)
                IQR = Q3 - Q1
                lower_bound = Q1 - 1.5 * IQR
                upper_bound = Q3 + 1.5 * IQR
                outliers = df[(df[col] < lower_bound) | (df[col] > upper_bound)]
                outlier_analysis[col] = {
                    "count": len(outliers),
                    "percentage": round(len(outliers) / len(df) * 100, 2),
                    "bounds": {
                        "lower": float(lower_bound),
                        "upper": float(upper_bound)
                    }
                }

            # Target column analysis (if specified)
            target_analysis = None
            if target_column and target_column in df.columns:
                target_series = df[target_column]
                if target_series.dtype in ['object', 'category']:
                    # Classification target
                    target_analysis = { # type: ignore
                        "type": "classification",
                        "classes": (
                            target_series.value_counts().to_dict()  # type: ignore[misc]
                        ),
                        "class_distribution": (
                            (target_series.value_counts() / len(df) * 100)
                            .round(2).to_dict()  # type: ignore[misc]
                        ),
                        "unique_classes": target_series.nunique()
                    }
                else:
                    # Regression target
                    target_analysis = { # type: ignore
                        "type": "regression",
                        "statistics": (
                            target_series.describe().to_dict()  # type: ignore[misc]
                        ),
                        "skewness": float(
                            target_series.skew()  # type: ignore[arg-type]
                        ),
                        "kurtosis": float(
                            target_series.kurtosis()  # type: ignore[arg-type]
                        )
                    }

            # Generate visualizations
            visualizations = {}
            if include_visualizations:
                visualizations = generate_visualizations(df)

            # Calculate processing time
            end_time = datetime.now()
            processing_time = (end_time - start_time).total_seconds()
            memory_used = df.memory_usage(deep=True).sum() / 1024 / 1024  # MB

            # Create EDA results
            eda_results = EDAResult(
                statistical_summary=statistical_summary,
                missing_values=statistical_summary.get("missing_values", {}),
                correlations=correlation_analysis,
                outliers=outlier_analysis,  # type: ignore[arg-type]
                data_types=statistical_summary.get("basic_info", {}).get("dtypes", {}),
                visualizations=visualizations,
                target_analysis=target_analysis  # type: ignore[arg-type]
            )

            # Save results to database
            await AnalysisService.save_eda_results(
                analysis.analysis_id,  # type: ignore[misc]
                eda_results,
                processing_time,
                memory_used
            )

            # Update dataset analysis count
            await DatasetService.update_analysis_count(dataset_id)

            # Log analytics
            await AnalyticsService.log_usage(
                user_id=user_id,
                action="eda_analysis",
                resource_id=analysis.analysis_id,  # type: ignore[misc]
                execution_time=processing_time,
                memory_used=memory_used,
                metadata={
                    "dataset_id": dataset_id,
                    "rows": len(df),
                    "columns": len(df.columns),
                    "target_column": target_column
                }
            )

            return JSONResponse(content={
                "status": "success",
                "message": "EDA analysis completed successfully",
                "data": {
                    "analysis_id": analysis.analysis_id,  # type: ignore[misc]
                    "dataset_info": {
                        "filename": dataset.original_filename,
                        "rows": len(df),
                        "columns": len(df.columns)
                    },
                    "processing_time": round(processing_time, 2),
                    "memory_used_mb": round(memory_used, 2),
                    "results": {
                        "statistical_summary": statistical_summary,
                        "correlation_analysis": correlation_analysis,
                        "outlier_analysis": outlier_analysis,
                        "target_analysis": target_analysis,
                        "visualizations": visualizations,
                        "recommendations": [
                            "Check and handle missing values before modeling",
                            "Consider removing or treating outliers",
                            "Examine highly correlated features for multicollinearity",
                            "Normalize/standardize numerical features if needed"
                        ]
                    }
                }
            })

        except Exception as e:
            # Update analysis status to failed
            await AnalysisService.update_analysis_status(
                analysis.analysis_id,  # type: ignore[misc]
                AnalysisStatus.FAILED,
                str(e)
            )
            raise HTTPException(
                status_code=500, detail=f"Analysis failed: {str(e)}"
            ) from e

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Internal server error: {str(e)}"
        ) from e


@router.get("/results/{analysis_id}")
async def get_eda_results(
    analysis_id: str,
    # pylint: disable=unused-argument
    db: Any = Depends(get_database)
) -> JSONResponse:
    """Retrieve EDA analysis results by analysis ID."""
    try:
        analysis = await AnalysisService.get_analysis_by_id(analysis_id)
        if not analysis:
            raise HTTPException(status_code=404, detail="Analysis not found")

        if analysis.status != AnalysisStatus.COMPLETED:
            return JSONResponse(content={
                "status": analysis.status.value,
                "message": f"Analysis is {analysis.status.value}",
                "error": analysis.error_message
            })

        return JSONResponse(content={
            "status": "success",
            "data": {
                "analysis_id": analysis.analysis_id, # type: ignore
                "created_at": analysis.created_at.isoformat(),
                "completed_at": analysis.completed_at.isoformat(), # type: ignore
                "processing_time": analysis.processing_time,
                "memory_used": analysis.memory_used,
                "results": (
                    analysis.eda_results.model_dump()  # type: ignore[misc]
                    if analysis.eda_results else None
                )
            }
        })

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to retrieve results: {str(e)}"
        ) from e


@router.get("/health")
async def eda_health_check() -> JSONResponse:
    """Health check for EDA service."""
    return JSONResponse(content={
        "status": "healthy",
        "service": "eda",
        "matplotlib_backend": matplotlib.get_backend(),
        "available_features": [
            "statistical_analysis",
            "correlation_analysis",
            "outlier_detection",
            "visualization_generation",
            "target_analysis"
        ]
    })
