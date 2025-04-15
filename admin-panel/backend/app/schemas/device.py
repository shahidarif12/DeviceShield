from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field

# Base Device Schema
class DeviceBase(BaseModel):
    id: str = Field(..., description="Device unique identifier (UUID)")
    manufacturer: Optional[str] = Field(None, description="Device manufacturer")
    model: Optional[str] = Field(None, description="Device model")
    os_version: Optional[str] = Field(None, description="Operating system version")
    firebase_token: Optional[str] = Field(None, description="Firebase Cloud Messaging token")
    
    class Config:
        from_attributes = True

# Device Create Schema
class DeviceCreate(DeviceBase):
    last_seen: datetime = Field(default_factory=datetime.utcnow, description="Last time device was seen")
    battery_level: Optional[int] = Field(None, description="Device battery level percentage")
    is_charging: Optional[bool] = Field(None, description="Whether device is charging")
    network_type: Optional[str] = Field(None, description="Network connection type")
    available_storage: Optional[int] = Field(None, description="Available storage in bytes")
    total_storage: Optional[int] = Field(None, description="Total storage in bytes")

# Device Update Schema
class DeviceUpdate(BaseModel):
    id: str = Field(..., description="Device unique identifier (UUID)")
    manufacturer: Optional[str] = None
    model: Optional[str] = None
    os_version: Optional[str] = None
    firebase_token: Optional[str] = None
    last_seen: datetime = Field(default_factory=datetime.utcnow)
    battery_level: Optional[int] = None
    is_charging: Optional[bool] = None
    network_type: Optional[str] = None
    available_storage: Optional[int] = None
    total_storage: Optional[int] = None
    
    class Config:
        from_attributes = True

# Device Response Schema
class DeviceResponse(DeviceBase):
    last_seen: datetime = Field(..., description="Last time device was seen")
    created_at: datetime = Field(..., description="When device was first registered")
    battery_level: Optional[int] = Field(None, description="Device battery level percentage")
    is_charging: Optional[bool] = Field(None, description="Whether device is charging")
    network_type: Optional[str] = Field(None, description="Network connection type")
    available_storage: Optional[int] = Field(None, description="Available storage in bytes")
    total_storage: Optional[int] = Field(None, description="Total storage in bytes")
    
    class Config:
        from_attributes = True

# Device Location Schema
class DeviceLocationBase(BaseModel):
    device_id: str = Field(..., description="Device unique identifier (UUID)")
    latitude: float = Field(..., description="Location latitude")
    longitude: float = Field(..., description="Location longitude")
    accuracy: Optional[float] = Field(None, description="Location accuracy in meters")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="When location was recorded")
    
    class Config:
        from_attributes = True

# Device Location Response Schema
class DeviceLocationResponse(DeviceLocationBase):
    id: int = Field(..., description="Location entry unique identifier")
    
    class Config:
        from_attributes = True
