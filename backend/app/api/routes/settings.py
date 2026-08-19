from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from app.api.dependencies import get_db
from app.models.models import SystemSettings
from app.schemas.schemas import SystemSettingsResponse, SystemSettingsUpdate, SimulationModeRequest
from app.simulation.engine import simulation_engine

router = APIRouter()

@router.get("/settings", response_model=SystemSettingsResponse)
def get_settings(db: Session = Depends(get_db)):
    settings = db.query(SystemSettings).first()
    if not settings:
        settings = SystemSettings()
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return SystemSettingsResponse.model_validate(settings)

@router.put("/settings", response_model=SystemSettingsResponse)
def update_settings(payload: SystemSettingsUpdate, db: Session = Depends(get_db)):
    settings = db.query(SystemSettings).first()
    if not settings:
        settings = SystemSettings()
        db.add(settings)

    if payload.low_threshold is not None:
        settings.low_threshold = payload.low_threshold
    if payload.medium_threshold is not None:
        settings.medium_threshold = payload.medium_threshold
    if payload.high_threshold is not None:
        settings.high_threshold = payload.high_threshold
    if payload.simulation_interval is not None:
        settings.simulation_interval = payload.simulation_interval
    if payload.simulation_mode is not None:
        settings.simulation_mode = payload.simulation_mode
    if payload.system_name is not None:
        settings.system_name = payload.system_name

    settings.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(settings)

    return SystemSettingsResponse.model_validate(settings)

@router.post("/simulation/mode", response_model=SystemSettingsResponse)
def set_simulation_mode(payload: SimulationModeRequest, db: Session = Depends(get_db)):
    valid_modes = ["Normal", "Warm", "Hot", "Cooling Down"]
    if payload.mode not in valid_modes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid mode. Must be one of: {', '.join(valid_modes)}"
        )

    settings = db.query(SystemSettings).first()
    if not settings:
        settings = SystemSettings()
        db.add(settings)

    settings.simulation_mode = payload.mode
    settings.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(settings)

    return SystemSettingsResponse.model_validate(settings)

@router.post("/simulation/start")
def start_simulation():
    simulation_engine.start()
    return {"status": "started", "running": True, "message": "Software simulation engine initiated."}

@router.post("/simulation/stop")
def stop_simulation():
    simulation_engine.stop()
    return {"status": "stopped", "running": False, "message": "Software simulation engine paused."}
