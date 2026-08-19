import pytest
from app.models.models import Alert
from app.services.alert_service import evaluate_temperature_alerts

def test_high_temperature_alert_creation(db_session):
    """Test that high temperature generates HIGH_TEMPERATURE alert."""
    evaluate_temperature_alerts(db_session, current_temp=36.2)

    alert = db_session.query(Alert).filter(Alert.resolved == False).first()
    assert alert is not None
    assert alert.alert_type == "HIGH_TEMPERATURE"
    assert alert.severity == "HIGH"
    assert alert.resolved == False

def test_critical_temperature_alert_severity(db_session):
    """Test that extreme high temperature (>38°C) sets CRITICAL severity."""
    evaluate_temperature_alerts(db_session, current_temp=39.5)

    alert = db_session.query(Alert).filter(Alert.resolved == False).first()
    assert alert is not None
    assert alert.severity == "CRITICAL"

def test_alert_deduplication(db_session):
    """Test that duplicate alerts are suppressed if an unresolved alert exists."""
    evaluate_temperature_alerts(db_session, current_temp=36.5)
    evaluate_temperature_alerts(db_session, current_temp=36.8)

    alerts = db_session.query(Alert).all()
    assert len(alerts) == 1

def test_alert_auto_resolution(db_session):
    """Test that alerts auto-resolve when temperature returns to comfort zone (<25°C)."""
    evaluate_temperature_alerts(db_session, current_temp=37.0)
    assert db_session.query(Alert).filter(Alert.resolved == False).count() == 1

    # Temp drops back to 23.5°C
    evaluate_temperature_alerts(db_session, current_temp=23.5)
    assert db_session.query(Alert).filter(Alert.resolved == False).count() == 0
    assert db_session.query(Alert).filter(Alert.resolved == True).count() == 1
