from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field

# Base User Schema
class UserBase(BaseModel):
    email: EmailStr = Field(..., description="User email")
    full_name: Optional[str] = Field(None, description="User full name")
    is_superuser: bool = Field(False, description="If user has admin privileges")
    
    class Config:
        from_attributes = True

# User Create Schema
class UserCreate(UserBase):
    password: str = Field(..., description="User password", min_length=8)

# User Update Schema
class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None
    is_superuser: Optional[bool] = None
    
    class Config:
        from_attributes = True

# User Response Schema
class UserResponse(UserBase):
    id: int = Field(..., description="User unique identifier")
    is_active: bool = Field(..., description="If user account is active")
    is_verified: bool = Field(..., description="If user email is verified")
    created_at: datetime = Field(..., description="When user was created")
    
    class Config:
        from_attributes = True

# Token Schema
class Token(BaseModel):
    token: str = Field(..., description="JWT access token")
    token_type: str = Field(..., description="Token type")

# Firebase Token Schema
class FirebaseToken(BaseModel):
    token: str = Field(..., description="Firebase ID token")
