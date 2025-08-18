"""
Celery configuration for SmartEDA Platform.

Handles asynchronous task processing for:
- Long-running EDA analysis
- ML model training
- Report generation
- Data preprocessing
"""

from celery import Celery # type: ignore
from app.settings import settings

# Create Celery instance
celery_app = Celery(  # type: ignore
    "smarteda_tasks",
    broker=settings.celery_broker_url,
    backend=settings.celery_result_backend,
    include=[
        'app.tasks.eda_tasks',
        'app.tasks.ml_tasks',
        'app.tasks.report_tasks'
    ]
)

# Celery configuration
celery_app.conf.update(  # type: ignore
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,  # 30 minutes max per task
    task_soft_time_limit=25 * 60,  # 25 minutes soft limit
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=1000,
)

# Task routing (optional - for multiple queues)
celery_app.conf.task_routes = {  # type: ignore
    'app.tasks.eda_tasks.*': {'queue': 'eda_queue'},
    'app.tasks.ml_tasks.*': {'queue': 'ml_queue'},
    'app.tasks.report_tasks.*': {'queue': 'report_queue'},
}

if __name__ == '__main__':
    celery_app.start()  # type: ignore
