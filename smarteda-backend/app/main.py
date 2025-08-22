"""
SmartEDA Platform - FastAPI Backend Main Application

A professional FastAPI backend for exploratory data analysis (EDA) and machine learning.
Provides automated analysis capabilities with enterprise-grade architecture.

Features:
- Automated EDA generation with statistical summaries and visualizations
- Machine learning model training and evaluation
- Professional API design with automatic documentation
- Database persistence with MongoDB
- User authentication and session management
- Analysis history tracking
"""

import logging

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.settings import get_settings, setup_logging
from app.database.connection import startup_database, shutdown_database
from app.database.connection import check_database_health # type: ignore
from app.routes import eda, ml, files
from app.routes import auth

# Setup logging
setup_logging()
logger = logging.getLogger(__name__)

settings = get_settings()


@asynccontextmanager
async def lifespan(_: FastAPI):
    """Application lifespan manager for startup and shutdown events."""
    # Startup
    logger.info("Starting SmartEDA Backend...")
    try:
        await startup_database()
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.warning("Database connection failed, running without persistence: %s", e)
        # Continue without database - API will work in stateless mode
    
    yield
    
    # Shutdown
    logger.info("Shutting down SmartEDA Backend...")
    try:
        await shutdown_database()
        logger.info("Database connection closed")
    except Exception as e:
        logger.warning("Error during shutdown: %s", e)


def create_application() -> FastAPI:
    """Create and configure FastAPI application."""
    
    application = FastAPI(
        title=settings.app_name,
        description="Professional EDA and ML API with MongoDB persistence",
        version=settings.app_version,
        docs_url="/docs" if settings.debug else None,
        redoc_url="/redoc" if settings.debug else None,
        lifespan=lifespan
    )
    
    # Configure CORS (hardcoded for local dev)
    application.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000", "http://localhost:5173"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    # Include routers with API prefix
    application.include_router(eda.router, prefix=f"{settings.api_prefix}/eda", tags=["EDA"])
    application.include_router(ml.router, prefix=f"{settings.api_prefix}/ml", tags=["Machine Learning"])
    application.include_router(files.router, prefix=f"{settings.api_prefix}/files", tags=["File Management"])
    application.include_router(auth.router, prefix=f"{settings.api_prefix}/auth", tags=["Authentication"])
    
    # Health check endpoint
    @application.get("/health")
    async def health_check(): # type: ignore
        """Health check endpoint."""
        db_health = await check_database_health() # type: ignore        
        return {
            "status": "healthy",
            "version": settings.app_version,
            "environment": settings.environment,
            "database": db_health
        } # type: ignore
    # Root endpoint
    @application.get("/")
    async def root(): # type: ignore
        """Root endpoint with API information."""
        return {
            "message": "SmartEDA Data Science Platform API",
            "version": settings.app_version,
            "docs": "/docs" if settings.debug else "Documentation disabled in production",
            "health": "/health"
        }
    
    logger.info("FastAPI application created - Environment: %s", settings.environment)
    return application


# Create the FastAPI app instance
app = create_application()
