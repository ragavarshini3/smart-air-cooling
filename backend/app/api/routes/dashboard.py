from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from app.api.dependencies import get_db
from app.models.models import SensorReading, FanState, Alert
from app.schemas.schemas import DashboardResponse, SensorReadingResponse, AlertResponse

router = APIRouter()

@router.get("/dashboard", response_model=DashboardResponse)
def get_dashboard_data(db: Session = Depends(get_db)):
    # Latest sensor reading
    latest_sensor = db.query(SensorReading).order_by(SensorReading.timestamp.desc()).first()
    curr_temp = latest_sensor.temperature if latest_sensor else 25.0
    curr_hum = latest_sensor.humidity if latest_sensor else 50.0

    # Latest fan state
    latest_fan = db.query(FanState).order_by(FanState.timestamp.desc()).first()
    fan_status = latest_fan.status if latest_fan else "OFF"
    fan_speed = latest_fan.speed if latest_fan else 0.0
    operating_mode = latest_fan.mode if latest_fan else "AUTO"

    # Latest unresolved alert
    latest_alert_model = db.query(Alert).filter(Alert.resolved == False).order_by(Alert.timestamp.desc()).first()
    current_alert = AlertResponse.model_validate(latest_alert_model) if latest_alert_model else None

    # Trend readings (last 20 readings)
    trend_readings = db.query(SensorReading).order_by(SensorReading.timestamp.desc()).limit(20).all()
    trend_readings.reverse()  # Chronological order

    formatted_trend = [SensorReadingResponse.model_validate(r) for r in trend_readings]

    return DashboardResponse(
        current_temperature=round(curr_temp, 1),
        current_humidity=round(curr_hum, 1),
        fan_status=fan_status,
        fan_speed=round(fan_speed, 1),
        operating_mode=operating_mode,
        system_status="ONLINE",
        current_alert=current_alert,
        temperature_trend=formatted_trend,
        humidity_trend=formatted_trend,
        last_updated=latest_sensor.timestamp if latest_sensor else datetime.now(timezone.utc)
    )
