"""FastAPI entrypoint for SmartEDA Data Science Platform."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import eda, ml, files

app = FastAPI(title="SmartEDA Data Science Platform", version="1.0.0")

# Enable CORS for frontend-backend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(eda.router, prefix="/api", tags=["EDA"])
app.include_router(ml.router, prefix="/api", tags=["ML"])
app.include_router(files.router, prefix="/api", tags=["Files"])
