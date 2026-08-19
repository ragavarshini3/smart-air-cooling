from datetime import datetime, timezone
from sqlalchemy import Column, Integer, Float, String, Boolean, DateTime, Text
from app.database.session import Base

def utc_now():
    return datetime.now(timezone.utc)

class SensorReading(Base):
    __tablename__ = "sensor_readings"

    id = Column(Integer, primary_key=True, index=True)
    temperature = Column(Float, nullable=False)
    humidity = Column(Float, nullable=False)
    timestamp = Column(DateTime, default=utc_now, index=True, nullable=False)

class FanState(Base):
    __tablename__ = "fan_states"

    id = Column(Integer, primary_key=True, index=True)
    status = Column(String(10), nullable=False, default="OFF")  # ON / OFF
    speed = Column(Float, nullable=False, default=0.0)         # 0 - 100%
    mode = Column(String(10), nullable=False, default="AUTO")    # AUTO / MANUAL
    timestamp = Column(DateTime, default=utc_now, index=True, nullable=False)

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    alert_type = Column(String(50), nullable=False)            # e.g., HIGH_TEMPERATURE
    message = Column(String(255), nullable=False)
    temperature = Column(Float, nullable=False)
    severity = Column(String(20), nullable=False, default="HIGH") # LOW, MEDIUM, HIGH, CRITICAL
    resolved = Column(Boolean, nullable=False, default=False)
    timestamp = Column(DateTime, default=utc_now, index=True, nullable=False)

class SystemSettings(Base):
    __tablename__ = "system_settings"

    id = Column(Integer, primary_key=True, index=True)
    low_threshold = Column(Float, nullable=False, default=25.0)     # < 25°C -> OFF
    medium_threshold = Column(Float, nullable=False, default=30.0)  # 25-30°C -> LOW
    high_threshold = Column(Float, nullable=False, default=35.0)    # 30-35°C -> MEDIUM, >35°C -> HIGH
    simulation_interval = Column(Integer, nullable=False, default=2) # seconds
    simulation_mode = Column(String(50), nullable=False, default="Normal") # Normal, Warm, Hot, Cooling Down
    system_name = Column(String(100), nullable=False, default="Smart Workspace Zone A")
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)

class AIConversation(Base):
    __tablename__ = "ai_conversations"

    id = Column(Integer, primary_key=True, index=True)
    user_message = Column(Text, nullable=False)
    ai_response = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=utc_now, index=True, nullable=False)
