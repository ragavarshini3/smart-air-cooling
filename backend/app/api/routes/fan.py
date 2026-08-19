from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from app.api.dependencies import get_db
from app.models.models import FanState
from app.schemas.schemas import FanStateResponse, FanControlRequest, SystemModeRequest

router = APIRouter()

@router.get("/fan/status", response_model=FanStateResponse)
def get_fan_status(db: Session = Depends(get_db)):
    latest = db.query(FanState).order_by(FanState.timestamp.desc()).first()
    if not latest:
        # Default state
        latest = FanState(status="OFF", speed=0.0, mode="AUTO")
        db.add(latest)
        db.commit()
        db.refresh(latest)
    return FanStateResponse.model_validate(latest)

@router.post("/fan/control", response_model=FanStateResponse)
def control_fan(payload: FanControlRequest, db: Session = Depends(get_db)):
    current = db.query(FanState).order_by(FanState.timestamp.desc()).first()
    
    new_status = payload.status if payload.status is not None else (current.status if current else "OFF")
    new_speed = payload.speed if payload.speed is not None else (current.speed if current else 0.0)
    new_mode = payload.mode if payload.mode is not None else (current.mode if current else "MANUAL")

    # Force status to OFF if speed is 0
    if new_speed == 0:
        new_status = "OFF"
    elif payload.status == "ON" and new_speed == 0:
        new_speed = 30.0

    new_state = FanState(
        status=new_status,
        speed=new_speed,
        mode=new_mode,
        timestamp=datetime.now(timezone.utc)
    )
    db.add(new_state)
    db.commit()
    db.refresh(new_state)

    return FanStateResponse.model_validate(new_state)

@router.post("/system/mode", response_model=FanStateResponse)
def set_system_mode(payload: SystemModeRequest, db: Session = Depends(get_db)):
    if payload.mode not in ["AUTO", "MANUAL"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Mode must be 'AUTO' or 'MANUAL'")

    current = db.query(FanState).order_by(FanState.timestamp.desc()).first()
    
    new_state = FanState(
        status=current.status if current else "OFF",
        speed=current.speed if current else 0.0,
        mode=payload.mode,
        timestamp=datetime.now(timezone.utc)
    )
    db.add(new_state)
    db.commit()
    db.refresh(new_state)

    return FanStateResponse.model_validate(new_state)
