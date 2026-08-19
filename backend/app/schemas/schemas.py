from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional, List

# Sensor Reading Schemas
class SensorReadingBase(BaseModel):
    temperature: float
    humidity: float

class SensorReadingCreate(SensorReadingBase):
    pass

class SensorReadingResponse(SensorReadingBase):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True

# Fan State Schemas
class FanStateBase(BaseModel):
    status: str
    speed: float
    mode: str

class FanControlRequest(BaseModel):
    status: Optional[str] = Field(None, description="'ON' or 'OFF'")
    speed: Optional[float] = Field(None, ge=0.0, le=100.0, description="Fan speed percentage (0-100)")
    mode: Optional[str] = Field(None, description="'AUTO' or 'MANUAL'")

class SystemModeRequest(BaseModel):
    mode: str = Field(..., description="'AUTO' or 'MANUAL'")

class FanStateResponse(FanStateBase):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True

# Alert Schemas
class AlertBase(BaseModel):
    alert_type: str
    message: str
    temperature: float
    severity: str
    resolved: bool = False

class AlertResponse(AlertBase):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True

# System Settings Schemas
class SystemSettingsBase(BaseModel):
    low_threshold: float = 25.0
    medium_threshold: float = 30.0
    high_threshold: float = 35.0
    simulation_interval: int = 2
    simulation_mode: str = "Normal"
    system_name: str = "Smart Workspace Zone A"

class SystemSettingsUpdate(BaseModel):
    low_threshold: Optional[float] = None
    medium_threshold: Optional[float] = None
    high_threshold: Optional[float] = None
    simulation_interval: Optional[int] = None
    simulation_mode: Optional[str] = None
    system_name: Optional[str] = None

class SystemSettingsResponse(SystemSettingsBase):
    id: int
    updated_at: datetime

    class Config:
        from_attributes = True

# Simulation Controls
class SimulationModeRequest(BaseModel):
    mode: str = Field(..., description="Simulation pattern: 'Normal', 'Warm', 'Hot', 'Cooling Down'")

# Dashboard Data Response
class DashboardResponse(BaseModel):
    current_temperature: float
    current_humidity: float
    fan_status: str
    fan_speed: float
    operating_mode: str
    system_status: str
    current_alert: Optional[AlertResponse] = None
    temperature_trend: List[SensorReadingResponse] = []
    humidity_trend: List[SensorReadingResponse] = []
    last_updated: datetime

# Analytics Summary Response
class AnalyticsSummaryResponse(BaseModel):
    current_temp: float
    avg_temp: float
    min_temp: float
    max_temp: float
    current_humidity: float
    avg_humidity: float
    min_humidity: float
    max_humidity: float
    total_operating_time_mins: float
    avg_fan_speed: float
    max_fan_speed: float
    auto_activations_count: int
    time_filter: str

# AI Chat Schemas
class AIChatRequest(BaseModel):
    user_message: str

class AIChatResponse(BaseModel):
    user_message: str
    ai_response: str
    timestamp: datetime

    class Config:
        from_attributes = True
