"""Main entry point for SmartEDA FastAPI backend.

This runs the FastAPI app defined in app/main.py
"""
import uvicorn

from app.main import app

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
