from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field

# Base Command Schema
class CommandBase(BaseModel):
    command: str = Field(..., description="Command type (e.g. 'get_location', 'take_photo')")
    params: Dict[str, Any] = Field(default_factory=dict, description="Command parameters")
    
    class Config:
        from_attributes = True

# Command Create Schema
class CommandCreate(CommandBase):
    pass

# Command Update Schema
class CommandUpdate(BaseModel):
    status: str = Field(..., description="Command status: 'pending', 'sent', 'completed', 'failed'")
    response: Optional[str] = Field(None, description="Command response or error message")
    
    class Config:
        from_attributes = True

# Command Response Schema
class CommandResponse(CommandBase):
    id: int = Field(..., description="Command unique identifier")
    device_id: str = Field(..., description="Target device ID")
    user_id: int = Field(..., description="User who issued the command")
    status: str = Field(..., description="Command status")
    response: Optional[str] = Field(None, description="Command response or error message")
    created_at: datetime = Field(..., description="When command was created")
    updated_at: datetime = Field(..., description="When command was last updated")
    
    class Config:
        from_attributes = True
