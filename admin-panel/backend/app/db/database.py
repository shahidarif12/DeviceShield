import os
from urllib.parse import urlparse, parse_qs
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool

from app.core.config import settings
from app.db.models import Base

# Create async engine based on URL from config
# Parse the URL to remove the sslmode parameter if present
database_url = settings.DATABASE_URL
url_parts = urlparse(database_url)
query_params = parse_qs(url_parts.query)

# Remove sslmode parameter if present
if 'sslmode' in query_params:
    del query_params['sslmode']

# Reconstruct the URL without the sslmode parameter
clean_url = f"{url_parts.scheme}://{url_parts.netloc}{url_parts.path}"
if query_params:
    clean_url += "?" + "&".join([f"{k}={v[0]}" for k, v in query_params.items()])

engine = create_async_engine(
    clean_url,
    echo=settings.DB_ECHO_LOG,
    future=True,
    poolclass=NullPool if settings.TESTING else None,
)

# Create async session factory
async_session = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

async def create_tables():
    """Create database tables if they don't exist."""
    async with engine.begin() as conn:
        # Create tables
        await conn.run_sync(Base.metadata.create_all)

async def get_session():
    """Get async database session."""
    async with async_session() as session:
        yield session