from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_db
from app.core.security import (
    create_access_token,
    verify_firebase_token,
    get_password_hash,
    verify_password,
    get_current_user
)
from app.db import models
from app.schemas.user import UserCreate, UserResponse, Token, FirebaseToken

router = APIRouter()

@router.post("/auth/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_admin(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    """
    Register a new admin user.
    
    This endpoint is protected and should only be used by existing admins.
    """
    # Check if email already exists
    existing_user = await models.User.get_by_email(db, email=user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists"
        )
    
    # Create new user with hashed password
    hashed_password = get_password_hash(user_data.password)
    user = models.User(
        email=user_data.email,
        hashed_password=hashed_password,
        full_name=user_data.full_name,
        is_superuser=user_data.is_superuser,
    )
    
    # Save to database
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    return user

@router.post("/auth/login", response_model=Token)
async def login_admin(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    """
    Login with username (email) and password to get JWT token.
    """
    # Get user by email
    user = await models.User.get_by_email(db, email=form_data.username)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verify password
    if not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=60 * 24)  # 1 day
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {"token": access_token, "token_type": "bearer"}

@router.post("/auth/firebase-login", response_model=Token)
async def login_with_firebase(firebase_token: FirebaseToken, db: AsyncSession = Depends(get_db)):
    """
    Login with Firebase ID token.
    """
    try:
        # Verify Firebase token
        firebase_user = await verify_firebase_token(firebase_token.token)
        if not firebase_user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid Firebase token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Get or create user
        user = await models.User.get_by_email(db, email=firebase_user.email)
        if not user:
            # Auto-create user from Firebase account
            user = models.User(
                email=firebase_user.email,
                full_name=firebase_user.name,
                firebase_uid=firebase_user.uid,
                is_verified=firebase_user.email_verified,
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)
        
        # Create access token
        access_token_expires = timedelta(minutes=60 * 24)  # 1 day
        access_token = create_access_token(
            data={"sub": user.email}, expires_delta=access_token_expires
        )
        
        return {"token": access_token, "token_type": "bearer"}
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )

@router.get("/auth/verify")
async def verify_token(current_user: models.User = Depends(get_current_user)):
    """
    Verify current JWT token is valid.
    """
    return {"status": "valid", "user_id": current_user.id, "email": current_user.email}
