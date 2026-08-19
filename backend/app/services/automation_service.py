import logging
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.models import SystemSettings, FanState

logger = logging.getLogger("smart_cooling.automation")

def evaluate_fan_automation(db: Session, current_temp: float) -> FanState:
    """
    Evaluates temperature against configured thresholds in SystemSettings
    and automatically updates FanState when system is in AUTO mode.
    """
    settings = db.query(SystemSettings).first()
    if not settings:
        low_t, med_t, high_t = 25.0, 30.0, 35.0
    else:
        low_t = settings.low_threshold
        med_t = settings.medium_threshold
        high_t = settings.high_threshold

    latest_fan = db.query(FanState).order_by(FanState.timestamp.desc()).first()
    current_mode = latest_fan.mode if latest_fan else "AUTO"

    # If in MANUAL mode, automation engine does not override fan status/speed
    if current_mode == "MANUAL":
        return latest_fan

    # Calculate desired fan state for AUTO mode
    if current_temp < low_t:
        target_status = "OFF"
        target_speed = 0.0
    elif current_temp < med_t:
        target_status = "ON"
        target_speed = 30.0
    elif current_temp < high_t:
        target_status = "ON"
        target_speed = 60.0
    else:
        target_status = "ON"
        target_speed = 100.0

    # Only create a new FanState entry if status or speed changed, or no prior entry exists
    if not latest_fan or latest_fan.status != target_status or abs(latest_fan.speed - target_speed) > 0.1:
        new_fan_state = FanState(
            status=target_status,
            speed=target_speed,
            mode="AUTO",
            timestamp=datetime.now(timezone.utc)
        )
        db.add(new_fan_state)
        db.commit()
        db.refresh(new_fan_state)
        logger.info(f"Automation triggered: Temp={current_temp:.1f}°C -> Fan {target_status} @ {target_speed:.0f}%")
        return new_fan_state

    return latest_fan
