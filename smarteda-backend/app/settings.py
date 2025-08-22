"""
Application settings and configuration for SmartEDA Platform.

This module handles:
- Environment-based configuration
- Application settings
- Database configuration
- Security settings
"""

import logging
from typing import List

from dotenv import load_dotenv  # type: ignore
from pydantic_settings import BaseSettings  # type: ignore

load_dotenv()

class Settings(BaseSettings):  # type: ignore
    """Application configuration settings."""

    app_name: str = "SmartEDA Data Science Platform"
    app_version: str = "1.0.0"
    environment: str = "development"
    debug: bool = True
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    api_prefix: str = "/api/v1"
    mongodb_url: str = "mongodb://localhost:27017"
    database_name: str = "smarteda_db"
  
    # Message Queue Settings
    redis_url: str = "redis://localhost:6379/0"
    celery_broker_url: str = "redis://localhost:6379/0"
    celery_result_backend: str = "redis://localhost:6379/0"

    # Vector Database Configuration
    vector_db_path: str = "./data/vector_db"
    embedding_model: str = "all-MiniLM-L6-v2"
    vector_dimension: int = 384
    similarity_threshold: float = 0.7
    jwt_secret_key: str = "your-super-secret-key-change-this"
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 30
    upload_dir: str = "./uploads"
    max_file_size: int = 104857600
    allowed_extensions: List[str] = ["csv", "xlsx", "xls"]
    allowed_origins: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173"
    ]

    class Config:
        """Pydantic configuration."""

        env_file = ".env"
        case_sensitive = False
        extra = "ignore"

settings = Settings()


def get_settings() -> Settings:
    """Get application settings instance."""
    return settings


def setup_logging():
    """Set up basic logging configuration."""
    logging.basicConfig(level=logging.INFO)
