# FastAPI entrypoint
from fastapi import FastAPI
from app.routes import eda, ml, files

app = FastAPI()

# Include routers
app.include_router(eda.router)
app.include_router(ml.router)
app.include_router(files.router)
