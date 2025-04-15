from typing import Generator, AsyncGenerator

from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_session
from app.db import models

# Create OAuth2 scheme without circular imports
from fastapi.security import OAuth2PasswordBearer
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Get database session.
    """
    async for session in get_session():
        yield session

async def get_current_user(
    db: AsyncSession = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> models.User:
    """
    Get the current authenticated user from JWT token.
    
    This is a wrapper around the security.get_current_user function
    to avoid circular imports.
    """
    from app.core.security import get_current_user as get_user
    
    return await get_user(token, db)