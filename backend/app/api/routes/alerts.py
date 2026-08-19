from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.api.dependencies import get_db
from app.models.models import Alert
from app.schemas.schemas import AlertResponse

router = APIRouter()

@router.get("/alerts", response_model=List[AlertResponse])
def get_alerts(
    resolved: Optional[bool] = Query(None, description="Filter by resolution status"),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    query = db.query(Alert)
    if resolved is not None:
        query = query.filter(Alert.resolved == resolved)
    
    alerts = query.order_by(Alert.timestamp.desc()).limit(limit).all()
    return [AlertResponse.model_validate(a) for a in alerts]

@router.patch("/alerts/{alert_id}/resolve", response_model=AlertResponse)
def resolve_alert(alert_id: int, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Alert with ID {alert_id} not found."
        )

    alert.resolved = True
    db.commit()
    db.refresh(alert)
    return AlertResponse.model_validate(alert)
