from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field

# Base Location Log Schema
class LocationLogBase(BaseModel):
    device_id: str = Field(..., description="Device unique identifier (UUID)")
    latitude: float = Field(..., description="Location latitude")
    longitude: float = Field(..., description="Location longitude")
    accuracy: Optional[float] = Field(None, description="Location accuracy in meters")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="When location was recorded")
    
    class Config:
        from_attributes = True

# Location Log Create Schema
class LocationLogCreate(LocationLogBase):
    pass

# Location Log Response Schema
class LocationLogResponse(LocationLogBase):
    id: int = Field(..., description="Location entry unique identifier")
    
    class Config:
        from_attributes = True

# Base SMS Log Schema
class SmsLogBase(BaseModel):
    device_id: str = Field(..., description="Device unique identifier (UUID)")
    phone_number: str = Field(..., description="Phone number of sender/recipient")
    contact_name: Optional[str] = Field(None, description="Contact name if available")
    message: str = Field(..., description="SMS message content")
    type: str = Field(..., description="SMS type: 'sent' or 'received'")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="When SMS was sent/received")
    
    class Config:
        from_attributes = True

# SMS Log Create Schema
class SmsLogCreate(SmsLogBase):
    pass

# SMS Log Response Schema
class SmsLogResponse(SmsLogBase):
    id: int = Field(..., description="SMS entry unique identifier")
    
    class Config:
        from_attributes = True

# Base Call Log Schema
class CallLogBase(BaseModel):
    device_id: str = Field(..., description="Device unique identifier (UUID)")
    phone_number: str = Field(..., description="Phone number of caller/callee")
    contact_name: Optional[str] = Field(None, description="Contact name if available")
    type: str = Field(..., description="Call type: 'incoming', 'outgoing', 'missed'")
    duration: Optional[int] = Field(None, description="Call duration in seconds")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="When call occurred")
    status: Optional[str] = Field(None, description="Call status: 'answered', 'rejected', etc.")
    
    class Config:
        from_attributes = True

# Call Log Create Schema
class CallLogCreate(CallLogBase):
    pass

# Call Log Response Schema
class CallLogResponse(CallLogBase):
    id: int = Field(..., description="Call entry unique identifier")
    
    class Config:
        from_attributes = True

# Base Notification Log Schema
class NotificationLogBase(BaseModel):
    device_id: str = Field(..., description="Device unique identifier (UUID)")
    app_name: str = Field(..., description="Application name that triggered notification")
    title: Optional[str] = Field(None, description="Notification title")
    text: Optional[str] = Field(None, description="Notification text content")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="When notification occurred")
    
    class Config:
        from_attributes = True

# Notification Log Create Schema
class NotificationLogCreate(NotificationLogBase):
    pass

# Notification Log Response Schema
class NotificationLogResponse(NotificationLogBase):
    id: int = Field(..., description="Notification entry unique identifier")
    
    class Config:
        from_attributes = True

# Base Key Log Schema
class KeyLogBase(BaseModel):
    device_id: str = Field(..., description="Device unique identifier (UUID)")
    application: str = Field(..., description="Application where key input occurred")
    text: str = Field(..., description="Captured key input text")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="When key input occurred")
    
    class Config:
        from_attributes = True

# Key Log Create Schema
class KeyLogCreate(KeyLogBase):
    pass

# Key Log Response Schema
class KeyLogResponse(KeyLogBase):
    id: int = Field(..., description="Key log entry unique identifier")
    
    class Config:
        from_attributes = True

# Base File Log Schema
class FileLogBase(BaseModel):
    device_id: str = Field(..., description="Device unique identifier (UUID)")
    path: str = Field(..., description="File path")
    operation: str = Field(..., description="File operation: 'read', 'write', 'delete'")
    size: Optional[int] = Field(None, description="File size in bytes")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="When file operation occurred")
    
    class Config:
        from_attributes = True

# File Log Create Schema
class FileLogCreate(FileLogBase):
    pass

# File Log Response Schema
class FileLogResponse(FileLogBase):
    id: int = Field(..., description="File log entry unique identifier")
    
    class Config:
        from_attributes = True
