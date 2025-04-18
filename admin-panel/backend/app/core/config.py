import os
import secrets
from typing import List, Optional
from urllib.parse import urlparse

# Simple configuration object
class Settings:
    # API settings
    API_V1_STR: str = "/api"
    SECRET_KEY: str = secrets.token_urlsafe(32)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day
    
    # Development mode
    DEV_MODE: bool = os.environ.get("DEV_MODE", "true").lower() in ("true", "1", "t")
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5000",
        "http://localhost:3000",
        "http://localhost:8000",
        "https://device-management-admin.vercel.app",
        # Wildcard for Replit domains to support direct previews
        "https://*.replit.app",
        "https://*.replit.dev",
        "https://*.repl.co"
    ]
    
    # Database
    DATABASE_URL: str = os.environ.get("DATABASE_URL", "")
    
    # Ensure DATABASE_URL uses the correct protocol for SQLAlchemy async
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+asyncpg://", 1)
    elif DATABASE_URL and not DATABASE_URL.startswith("postgresql+asyncpg://"):
        DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)
    
    # SQLite fallback (for development/testing)
    SQLITE_DB: str = "device_management.db"
    USE_SQLITE: bool = False  # Set to True to use SQLite instead of PostgreSQL
    
    if USE_SQLITE:
        DATABASE_URL = f"sqlite+aiosqlite:///./{SQLITE_DB}"
    
    # Firebase
    FIREBASE_CREDENTIALS: Optional[str] = None  # Path to service account JSON file
    FIREBASE_API_KEY: Optional[str] = os.environ.get("VITE_FIREBASE_API_KEY")
    FIREBASE_PROJECT_ID: Optional[str] = os.environ.get("VITE_FIREBASE_PROJECT_ID")
    FIREBASE_APP_ID: Optional[str] = os.environ.get("VITE_FIREBASE_APP_ID")
    
    # Other settings
    TESTING: bool = False
    DB_ECHO_LOG: bool = False

settings = Settings()