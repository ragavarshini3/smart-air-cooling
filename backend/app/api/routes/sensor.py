from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from app.api.dependencies import get_db
from app.models.models import SensorReading
from app.schemas.schemas import SensorReadingResponse

router = APIRouter()

@router.get("/sensor/latest", response_model=SensorReadingResponse)
def get_latest_sensor_reading(db: Session = Depends(get_db)):
    latest = db.query(SensorReading).order_by(SensorReading.timestamp.desc()).first()
    if not latest:
        # Fallback reading if DB is brand new
        return SensorReadingResponse(id=0, temperature=25.0, humidity=50.0, timestamp=SensorReading.timestamp.default.arg())
    return SensorReadingResponse.model_validate(latest)

@router.get("/sensor/history", response_model=List[SensorReadingResponse])
def get_sensor_history(limit: int = Query(50, ge=1, le=500), db: Session = Depends(get_db)):
    readings = db.query(SensorReading).order_by(SensorReading.timestamp.desc()).limit(limit).all()
    readings.reverse()
    return [SensorReadingResponse.model_validate(r) for r in readings]
