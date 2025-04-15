from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_db, get_current_user
from app.db import models
from app.schemas.device import (
    DeviceCreate,
    DeviceResponse,
    DeviceUpdate,
    DeviceLocationResponse
)

router = APIRouter()

@router.get("/devices", response_model=List[DeviceResponse])
async def get_devices(
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get all registered devices.
    """
    devices = await models.Device.get_all(db, skip=skip, limit=limit)
    return devices

@router.get("/devices/{device_id}", response_model=DeviceResponse)
async def get_device(
    device_id: str,
    current_user: models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get a specific device by ID.
    """
    device = await models.Device.get_by_id(db, device_id=device_id)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    return device

@router.post("/devices", response_model=DeviceResponse, status_code=status.HTTP_201_CREATED)
async def register_device(
    device: DeviceCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Register a new device. This endpoint is used by the mobile client.
    No authentication required as this is the initial registration.
    """
    # Check if device already exists
    existing_device = await models.Device.get_by_id(db, device_id=device.id)
    if existing_device:
        # Update existing device
        for key, value in device.dict(exclude_unset=True).items():
            setattr(existing_device, key, value)
        
        await db.commit()
        await db.refresh(existing_device)
        return existing_device
    
    # Create new device
    new_device = models.Device(**device.dict())
    db.add(new_device)
    await db.commit()
    await db.refresh(new_device)
    
    return new_device

@router.put("/devices/{device_id}", response_model=DeviceResponse)
async def update_device(
    device_id: str,
    device_update: DeviceUpdate,
    current_user: models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update device information.
    """
    device = await models.Device.get_by_id(db, device_id=device_id)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    
    # Update device fields
    for key, value in device_update.dict(exclude_unset=True).items():
        setattr(device, key, value)
    
    await db.commit()
    await db.refresh(device)
    
    return device

@router.get("/devices/{device_id}/locations", response_model=List[DeviceLocationResponse])
async def get_device_locations(
    device_id: str,
    time_range: Optional[str] = Query("24h", description="Time range (24h, 7d, 30d, all)"),
    limit: Optional[int] = Query(50, description="Maximum number of location points to return"),
    current_user: models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get location history for a specific device.
    """
    # Verify device exists
    device = await models.Device.get_by_id(db, device_id=device_id)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    
    # Calculate time filter based on time_range
    time_filter = models.get_time_filter(time_range)
    
    # Get location history
    locations = await models.DeviceLocation.get_by_device_id(
        db, 
        device_id=device_id, 
        time_filter=time_filter,
        limit=limit
    )
    
    return locations

@router.post("/devices/heartbeat", status_code=status.HTTP_200_OK)
async def device_heartbeat(
    heartbeat_data: DeviceUpdate,
    db: AsyncSession = Depends(get_db)
):
    """
    Receive heartbeat from device. Updates last_seen timestamp.
    This endpoint is used by the mobile client.
    """
    device = await models.Device.get_by_id(db, device_id=heartbeat_data.id)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    
    # Update device with heartbeat data
    for key, value in heartbeat_data.dict(exclude_unset=True).items():
        setattr(device, key, value)
    
    # Always update last_seen
    device.last_seen = heartbeat_data.last_seen
    
    await db.commit()
    
    return {"status": "ok"}
