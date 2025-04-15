from datetime import datetime, timedelta
from typing import Optional, Union, Dict, Any

import jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.db import models

# Import oauth2_scheme from deps to avoid circular imports
from app.core.deps import oauth2_scheme, get_db
from app.firebase.firebase_admin import verify_id_token, get_firebase_user

# Setup password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password."""
    return pwd_context.hash(password)


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT token for user authentication."""
    to_encode = data.copy()
    
    # Set expiration
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    
    to_encode.update({"exp": expire})
    
    # Create JWT token
    encoded_jwt = jwt.encode(
        to_encode, 
        settings.SECRET_KEY, 
        algorithm=settings.ALGORITHM
    )
    
    return encoded_jwt


async def verify_firebase_token(token: str) -> Optional[Dict[str, Any]]:
    """Verify Firebase ID token and return user info."""
    try:
        # Verify token with Firebase Admin SDK
        decoded_token = await verify_id_token(token)
        
        if not decoded_token:
            return None
        
        # Get user info from Firebase
        user_info = await get_firebase_user(decoded_token["uid"])
        
        return user_info
    except Exception as e:
        print(f"Firebase token verification error: {e}")
        return None


async def get_current_user(
    token: str = Depends(oauth2_scheme), 
    db: AsyncSession = Depends(get_db)
) -> models.User:
    """Get the current authenticated user from JWT token."""
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Decode JWT token
        payload = jwt.decode(
            token, 
            settings.SECRET_KEY, 
            algorithms=[settings.ALGORITHM]
        )
        
        # Get email from token
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        
    except jwt.PyJWTError:
        raise credentials_exception
    
    # Get user from database
    user = await models.User.get_by_email(db, email=email)
    if user is None:
        raise credentials_exception
    
    # Check if user is active
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    
    return user


async def get_current_active_superuser(
    current_user: models.User = Depends(get_current_user),
) -> models.User:
    """Check if the current user is a superuser."""
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )
    return current_user
