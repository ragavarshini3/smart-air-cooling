import logging
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.models import SystemSettings, Alert

logger = logging.getLogger("smart_cooling.alerts")

def evaluate_temperature_alerts(db: Session, current_temp: float) -> None:
    """
    Evaluates temperature against thermal limits and generates deduplicated alerts.
    """
    settings = db.query(SystemSettings).first()
    high_threshold = settings.high_threshold if settings else 35.0
    low_threshold = settings.low_threshold if settings else 25.0

    # 1. High Temperature Alert
    if current_temp >= high_threshold:
        # Deduplication check: check if an unresolved HIGH_TEMPERATURE alert already exists
        existing_alert = db.query(Alert).filter(
            Alert.alert_type == "HIGH_TEMPERATURE",
            Alert.resolved == False
        ).first()

        if not existing_alert:
            severity = "CRITICAL" if current_temp >= high_threshold + 3.0 else "HIGH"
            msg = f"Temperature reached {current_temp:.1f}°C, exceeding high threshold ({high_threshold}°C). Fan cooling initiated."
            
            new_alert = Alert(
                alert_type="HIGH_TEMPERATURE",
                message=msg,
                temperature=current_temp,
                severity=severity,
                resolved=False,
                timestamp=datetime.now(timezone.utc)
            )
            db.add(new_alert)
            db.commit()
            logger.warning(f"ALERT GENERATED: [{severity}] {msg}")
    
    # 2. Auto-resolution when returning to safe temperature
    elif current_temp < low_threshold:
        active_alerts = db.query(Alert).filter(
            Alert.alert_type == "HIGH_TEMPERATURE",
            Alert.resolved == False
        ).all()
        
        for alert in active_alerts:
            alert.resolved = True
            logger.info(f"Alert ID {alert.id} automatically resolved as temperature returned to comfort zone ({current_temp:.1f}°C).")
        
        if active_alerts:
            db.commit()
