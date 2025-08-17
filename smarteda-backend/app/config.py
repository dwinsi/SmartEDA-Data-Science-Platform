"""Configuration settings for SmartEDA Data Science Platform."""
import os

DB_URI = os.getenv('DB_URI', 'mongodb://localhost:27017')
API_KEY = os.getenv('API_KEY', '')
