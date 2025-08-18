"""
Database configuration and connection management for SmartEDA Platform.

This module handles:
- MongoDB connection setup
- Database initialization
- Connection pooling and management
- Environment-based configuration
"""

import logging
import os
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import Optional

from beanie import init_beanie  # type: ignore
from motor.motor_asyncio import AsyncIOMotorClient  # type: ignore
from pymongo.errors import ConnectionFailure  # type: ignore

from app.models.database import (
    AnalysisHistory,
    DatasetMetadata,
    ModelComparison,
    SystemConfig,
    UsageAnalytics,
    User,
    UserSession,
)

# Configure logging
logger = logging.getLogger(__name__)


class DatabaseConfig:
    """Database configuration settings."""

    def __init__(self):
        # MongoDB connection settings
        self.MONGODB_URL = os.getenv(
            "MONGODB_URL",
            "mongodb://localhost:27017"
        )
        self.DATABASE_NAME = os.getenv("DATABASE_NAME", "smarteda_db")

        # Connection pool settings
        self.MAX_POOL_SIZE = int(os.getenv("MONGODB_MAX_POOL_SIZE", "50"))
        self.MIN_POOL_SIZE = int(os.getenv("MONGODB_MIN_POOL_SIZE", "5"))
        max_idle_env = os.getenv("MONGODB_MAX_IDLE_TIME_MS", "30000")
        self.MAX_IDLE_TIME_MS = int(max_idle_env)

        # Connection timeout settings
        connect_timeout_env = os.getenv("MONGODB_CONNECT_TIMEOUT_MS", "5000")
        self.CONNECT_TIMEOUT_MS = int(connect_timeout_env)
        selection_timeout_env = os.getenv(
            "MONGODB_SERVER_SELECTION_TIMEOUT_MS", "5000"
        )
        self.SERVER_SELECTION_TIMEOUT_MS = int(selection_timeout_env)

        # Application settings
        self.ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
        self.DEBUG = os.getenv("DEBUG", "false").lower() == "true"


class DatabaseManager:
    """Manages database connections and operations."""

    def __init__(self, config: Optional[DatabaseConfig] = None):
        self.config = config or DatabaseConfig()
        self.client: Optional[AsyncIOMotorClient] = None  # type: ignore
        self.database = None
        self._initialized = False

    async def connect(self) -> None:
        """Establish connection to MongoDB."""
        try:
            logger.info("Connecting to MongoDB at %s", self.config.MONGODB_URL)

            # Create MongoDB client with connection pooling
            self.client = AsyncIOMotorClient(
                self.config.MONGODB_URL,
                maxPoolSize=self.config.MAX_POOL_SIZE,
                minPoolSize=self.config.MIN_POOL_SIZE,
                maxIdleTimeMS=self.config.MAX_IDLE_TIME_MS,
                connectTimeoutMS=self.config.CONNECT_TIMEOUT_MS,
                serverSelectionTimeoutMS=self.config.SERVER_SELECTION_TIMEOUT_MS,
                retryWrites=True,
                retryReads=True
            )

            # Test the connection
            await self.client.admin.command('ping')  # type: ignore
            logger.info("Successfully connected to MongoDB")

            # Get database reference
            self.database = self.client[self.config.DATABASE_NAME]  # type: ignore

        except ConnectionFailure as e:
            logger.error("Failed to connect to MongoDB: %s", e)
            raise
        except RuntimeError as e:
            logger.error("Unexpected error connecting to MongoDB: %s", e)
            raise
    
    async def initialize_beanie(self) -> None:
        """Initialize Beanie ODM with document models."""
        if not self.client:  # type: ignore
            raise RuntimeError(
                "Database client not connected. Call connect() first."
            )

        try:
            logger.info("Initializing Beanie ODM...")

            # Initialize Beanie with all document models
            await init_beanie(
                database=self.database,  # type: ignore
                document_models=[
                    User,
                    UserSession,
                    DatasetMetadata,
                    AnalysisHistory,
                    ModelComparison,
                    SystemConfig,
                    UsageAnalytics
                ]
            )

            self._initialized = True
            logger.info("Beanie ODM initialized successfully")

        except (ConnectionFailure, RuntimeError) as e:
            logger.error("Failed to initialize Beanie ODM: %s", e)
            raise
    
    async def disconnect(self) -> None:
        """Close database connection."""
        if self.client:  # type: ignore
            logger.info("Closing MongoDB connection...")
            self.client.close()  # type: ignore
            self.client = None
            self.database = None
            self._initialized = False
            logger.info("MongoDB connection closed")

    async def health_check(self) -> bool:
        """Check database connection health."""
        try:
            if not self.client:  # type: ignore
                return False

            # Ping the database
            await self.client.admin.command('ping')  # type: ignore
            return True

        except (ConnectionFailure, RuntimeError) as e:
            logger.warning("Database health check failed: %s", e)
            return False
    
    async def create_indexes(self) -> None:
        """Create database indexes for optimal performance."""
        if not self.database:  # type: ignore
            raise RuntimeError("Database not initialized")

        try:
            logger.info("Creating database indexes...")

            # User collection indexes
            await self.database.users.create_index("email", unique=True)  # type: ignore
            await self.database.users.create_index("username", unique=True)  # type: ignore

            # Dataset collection indexes
            await self.database.datasets.create_index("uploaded_by")  # type: ignore
            await self.database.datasets.create_index("uploaded_at")  # type: ignore
            await self.database.datasets.create_index("file_type")  # type: ignore

            # Analysis history indexes
            analysis_db = self.database.analysis_history  # type: ignore
            await analysis_db.create_index("analysis_id", unique=True)  # type: ignore
            await analysis_db.create_index("dataset_id")  # type: ignore
            await analysis_db.create_index("user_id")  # type: ignore
            await analysis_db.create_index("created_at")  # type: ignore
            await analysis_db.create_index("status")  # type: ignore

            # Model comparison indexes
            comparison_db = self.database.model_comparisons  # type: ignore
            await comparison_db.create_index("experiment_id", unique=True)  # type: ignore
            await comparison_db.create_index("dataset_id")  # type: ignore
            await comparison_db.create_index("user_id")  # type: ignore

            # Usage analytics indexes
            analytics_db = self.database.usage_analytics  # type: ignore
            await analytics_db.create_index("user_id")  # type: ignore
            await analytics_db.create_index("timestamp")  # type: ignore
            await analytics_db.create_index("action")  # type: ignore

            logger.info("Database indexes created successfully")

        except (ConnectionFailure, RuntimeError) as e:
            logger.error("Failed to create database indexes: %s", e)
            raise
    
    @property
    def is_initialized(self) -> bool:
        """Check if database is properly initialized."""
        return self._initialized and self.client is not None  # type: ignore


# Global database manager instance
db_manager = DatabaseManager()


async def get_database():  # type: ignore
    """Dependency function to get database connection."""
    if not db_manager.is_initialized:
        raise RuntimeError("Database not initialized")
    return db_manager.database  # type: ignore


@asynccontextmanager
async def get_db_session():  # type: ignore
    """Context manager for database sessions."""
    try:
        yield db_manager.database  # type: ignore
    except (ConnectionFailure, RuntimeError) as e:
        logger.error("Database session error: %s", e)
        raise


# Database lifecycle management functions
async def startup_database():
    """Initialize database connection on application startup."""
    try:
        await db_manager.connect()
        await db_manager.initialize_beanie()
        await db_manager.create_indexes()
        logger.info("Database startup completed successfully")
    except (ConnectionFailure, RuntimeError) as e:
        logger.error("Database startup failed: %s", e)
        raise


async def shutdown_database():
    """Close database connection on application shutdown."""
    try:
        await db_manager.disconnect()
        logger.info("Database shutdown completed successfully")
    except ConnectionFailure as e:
        logger.error("Database shutdown error (connection failure): %s", e)
    except RuntimeError as e:
        logger.error("Database shutdown error (runtime): %s", e)


# Health check function
async def check_database_health() -> dict:  # type: ignore
    """Comprehensive database health check."""
    health_status = {  # type: ignore
        "database": "unhealthy",
        "connection": False,
        "collections": {},
        "indexes": {},
        "timestamp": None
    }

    try:
        # Check basic connection
        health_status["connection"] = await db_manager.health_check()
        if health_status["connection"] and db_manager.database:  # type: ignore
            # Check collections
            collections = await db_manager.database.list_collection_names()  # type: ignore
            for collection in collections:  # type: ignore
                count = await db_manager.database[collection].count_documents({})  # type: ignore
                health_status["collections"][collection] = count

            # Check indexes
            for collection in collections:  # type: ignore
                indexes = await db_manager.database[collection].list_indexes().to_list(None)  # type: ignore
                health_status["indexes"][collection] = len(indexes)  # type: ignore

            health_status["database"] = "healthy"

        health_status["timestamp"] = datetime.now(timezone.utc).isoformat()

    except (ConnectionFailure, RuntimeError) as e:  # type: ignore
        health_status["error"] = str(e)  # type: ignore
        logger.error("Health check failed: %s", e)  # type: ignore

    return health_status  # type: ignore
