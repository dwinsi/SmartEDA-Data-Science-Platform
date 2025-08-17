"""EDA utilities for SmartEDA Data Science Platform."""

import io
import base64
from typing import Dict, Any

import pandas as pd
from matplotlib import pyplot as plt


def profile_data(df: pd.DataFrame, target_column: str = None, full: bool = False) -> Dict[str, Any]:
    """Profile a pandas DataFrame with summary statistics."""
    # Basic statistics
    sample = df.head(10).to_dict(orient='records')  # type: ignore
    
    # Outlier detection for numeric columns
    outliers = {}
    for col in df.select_dtypes(include='number').columns:
        Q1 = df[col].quantile(0.25)
        Q3 = df[col].quantile(0.75)
        IQR = Q3 - Q1
        mask = (df[col] < (Q1 - 1.5 * IQR)) | (df[col] > (Q3 + 1.5 * IQR))
        outliers[col] = int(mask.sum())
    
    # Unique counts for categorical columns
    unique_counts = {}
    for col in df.select_dtypes(include='object').columns:
        unique_counts[col] = int(df[col].nunique())
    
    # Correlation matrix
    corr = df.select_dtypes(include='number').corr().to_dict()  # type: ignore
    
    # Create visualizations
    viz = {}
    for col in df.select_dtypes(include='number').columns:
        # Histogram
        fig, ax = plt.subplots()  # type: ignore
        df[col].hist(ax=ax, bins=20)  # type: ignore
        ax.set_title(f"Histogram of {col}")  # type: ignore
        buf = io.BytesIO()
        plt.savefig(buf, format='png')  # type: ignore
        plt.close(fig)
        buf.seek(0)
        viz[f"{col}_histogram"] = base64.b64encode(buf.read()).decode('utf-8')
    
    # Build result dictionary
    result = {
        "shape": tuple(df.shape),
        "columns": list(df.columns),
        "dtypes": {col: str(dtype) for col, dtype in df.dtypes.items()},
        "missing": df.isnull().sum().to_dict(),  # type: ignore
        "describe": df.describe(include='all').to_dict(),  # type: ignore
        "outliers": outliers,
        "unique_counts": unique_counts,
        "correlation": corr,
        "sample": sample,
        "visualizations": viz
    }
    
    # Add target column analysis if provided
    if target_column and target_column in df.columns:
        balance = df[target_column].value_counts(dropna=False).to_dict()  # type: ignore
        result["class_balance"] = balance
        
        stats = df.groupby(target_column).mean(numeric_only=True).to_dict()  # type: ignore
        result["grouped_stats"] = stats
    
    # Add correlation heatmap if full analysis requested
    if full:
        import seaborn as sns
        fig, ax = plt.subplots(figsize=(8, 6))  # type: ignore
        sns.heatmap(df.corr(numeric_only=True), annot=True, fmt='.2f', cmap='coolwarm', ax=ax)  # type: ignore
        ax.set_title("Correlation Heatmap")  # type: ignore
        buf = io.BytesIO()
        plt.savefig(buf, format='png')  # type: ignore
        plt.close(fig)
        buf.seek(0)
        result["correlation_heatmap"] = base64.b64encode(buf.read()).decode('utf-8')
    
    return result
