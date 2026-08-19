from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.api.dependencies import get_db

router = APIRouter()

@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    db_status = "ONLINE"
    try:
        db.execute(text("SELECT 1"))
    except Exception:
        db_status = "OFFLINE"
        
    return {
        "status": "ONLINE",
        "database": db_status,
        "service": "Smart Air-Cooling Backend",
        "version": "1.0.0"
    }
