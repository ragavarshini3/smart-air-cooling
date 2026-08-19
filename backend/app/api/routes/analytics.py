from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, List

from app.api.dependencies import get_db
from app.models.models import SensorReading, FanState, Alert
from app.schemas.schemas import AnalyticsSummaryResponse, SensorReadingResponse

router = APIRouter()

@router.get("/analytics/summary")
def get_analytics_summary(
    filter: str = Query("today", description="Time filter: '1h', '6h', 'today', '7d'"),
    db: Session = Depends(get_db)
):
    now = datetime.now(timezone.utc)
    
    if filter == "1h":
        start_time = now - timedelta(hours=1)
    elif filter == "6h":
        start_time = now - timedelta(hours=6)
    elif filter == "7d":
        start_time = now - timedelta(days=7)
    else:  # today default
        start_time = datetime(now.year, now.month, now.day, tzinfo=timezone.utc)

    # 1. Sensor Metrics Query
    sensor_query = db.query(SensorReading).filter(SensorReading.timestamp >= start_time)
    readings = sensor_query.order_by(SensorReading.timestamp.asc()).all()

    if not readings:
        # Fallback if no readings in range
        latest = db.query(SensorReading).order_by(SensorReading.timestamp.desc()).first()
        readings = [latest] if latest else []

    if readings:
        temps = [r.temperature for r in readings]
        hums = [r.humidity for r in readings]
        current_temp = temps[-1]
        avg_temp = sum(temps) / len(temps)
        min_temp = min(temps)
        max_temp = max(temps)

        current_hum = hums[-1]
        avg_hum = sum(hums) / len(hums)
        min_hum = min(hums)
        max_hum = max(hums)
    else:
        current_temp = avg_temp = min_temp = max_temp = 25.0
        current_hum = avg_hum = min_hum = max_hum = 50.0

    # 2. Fan Metrics Query
    fan_query = db.query(FanState).filter(FanState.timestamp >= start_time).all()
    if fan_query:
        speeds = [f.speed for f in fan_query]
        avg_speed = sum(speeds) / len(speeds)
        max_speed = max(speeds)
        
        # Calculate operating time (approximate based on active fan steps)
        on_steps = sum(1 for f in fan_query if f.status == "ON")
        total_operating_mins = round(on_steps * (2.0 / 60.0), 1)  # ~2 sec per step

        # Auto activations count
        auto_activations = 0
        prev_status = "OFF"
        for f in fan_query:
            if f.mode == "AUTO" and f.status == "ON" and prev_status == "OFF":
                auto_activations += 1
            prev_status = f.status
    else:
        avg_speed = 0.0
        max_speed = 0.0
        total_operating_mins = 0.0
        auto_activations = 0

    # Format chart time series (sample to max 100 points for smooth performance)
    step_size = max(1, len(readings) // 100) if readings else 1
    sampled_readings = readings[::step_size] if readings else []

    chart_series = [
        {
            "timestamp": r.timestamp.isoformat(),
            "temperature": r.temperature,
            "humidity": r.humidity
        }
        for r in sampled_readings
    ]

    return {
        "current_temp": round(current_temp, 1),
        "avg_temp": round(avg_temp, 1),
        "min_temp": round(min_temp, 1),
        "max_temp": round(max_temp, 1),
        "current_humidity": round(current_hum, 1),
        "avg_humidity": round(avg_hum, 1),
        "min_humidity": round(min_hum, 1),
        "max_humidity": round(max_hum, 1),
        "total_operating_time_mins": total_operating_mins,
        "avg_fan_speed": round(avg_speed, 1),
        "max_fan_speed": round(max_speed, 1),
        "auto_activations_count": auto_activations,
        "time_filter": filter,
        "history": chart_series
    }
