from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_db, get_current_user
from app.db import models
from app.schemas.command import CommandCreate, CommandResponse
from app.firebase.firebase_admin import send_command_to_device

router = APIRouter()

@router.post("/devices/{device_id}/commands", response_model=CommandResponse, status_code=status.HTTP_201_CREATED)
async def send_command(
    device_id: str,
    command: CommandCreate,
    background_tasks: BackgroundTasks,
    current_user: models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Send a command to a device.
    """
    # Verify device exists
    device = await models.Device.get_by_id(db, device_id=device_id)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    
    # Verify device has firebase token
    if not device.firebase_token:
        raise HTTPException(
            status_code=400, 
            detail="Device doesn't have a valid Firebase token for messaging"
        )
    
    # Create command in database
    new_command = models.Command(
        device_id=device_id,
        command=command.command,
        params=command.params,
        status="pending",
        user_id=current_user.id
    )
    
    db.add(new_command)
    await db.commit()
    await db.refresh(new_command)
    
    # Send command to device via Firebase
    background_tasks.add_task(
        send_command_to_device,
        device.firebase_token,
        {
            "command": command.command,
            "params": command.params,
            "command_id": str(new_command.id)
        }
    )
    
    return new_command

@router.get("/devices/{device_id}/commands", response_model=List[CommandResponse])
async def get_commands_history(
    device_id: str,
    limit: Optional[int] = 50,
    current_user: models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get command history for a device.
    """
    # Verify device exists
    device = await models.Device.get_by_id(db, device_id=device_id)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    
    # Get commands
    commands = await models.Command.get_by_device_id(db, device_id=device_id, limit=limit)
    
    return commands

@router.post("/commands/{command_id}/response", status_code=status.HTTP_200_OK)
async def update_command_status(
    command_id: int,
    status: str,
    response: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Update command status. This endpoint is used by the mobile client.
    """
    command = await models.Command.get_by_id(db, command_id=command_id)
    if not command:
        raise HTTPException(status_code=404, detail="Command not found")
    
    # Update command status
    command.status = status
    if response:
        command.response = response
    
    await db.commit()
    
    return {"status": "updated"}
