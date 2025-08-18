import os
from typing import List
from pydantic_settings import BaseSettings  # type: ignore
from dotenv import load_dotenv  # type: ignore

load_dotenv()

class Settings(BaseSettings):  # type: ignore
    app_name: str = 'SmartEDA Data Science Platform'
    app_version: str = '1.0.0'
    environment: str = 'development'
    debug: bool = False
    api_host: str = '0.0.0.0'
    api_port: int = 8000
    api_prefix: str = '/api/v1'
    mongodb_url: str = 'mongodb://localhost:27017'
    database_name: str = 'smarteda_db'
    jwt_secret_key: str = 'your-super-secret-key-change-this'
    jwt_algorithm: str = 'HS256'
    jwt_access_token_expire_minutes: int = 30
    upload_dir: str = './uploads'
    max_file_size: int = 104857600
    allowed_extensions: List[str] = ['csv', 'xlsx', 'xls']
    allowed_origins: List[str] = ['http://localhost:3000', 'http://localhost:5173']
    
    class Config:
        env_file = '.env'
        case_sensitive = False
        extra = 'ignore'

settings = Settings()

def get_settings() -> Settings:
    return settings

def setup_logging():
    import logging
    logging.basicConfig(level=logging.INFO)
