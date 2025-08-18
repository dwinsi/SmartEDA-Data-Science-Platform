"""
Task module initialization.

This module makes the tasks directory a Python package and 
provides centralized imports for all task modules.
"""

# Import all task modules to register them with Celery
from .eda_tasks import analyze_dataset_async, generate_visualizations_async # type: ignore
from .ml_tasks import train_model_async, hyperparameter_tuning_async # type: ignore
from .report_tasks import generate_report_async, export_data_async # type: ignore

# Export all tasks for easy importing
__all__ = [
    'analyze_dataset_async',
    'generate_visualizations_async',
    'train_model_async',
    'hyperparameter_tuning_async',
    'generate_report_async',
    'export_data_async'
]
