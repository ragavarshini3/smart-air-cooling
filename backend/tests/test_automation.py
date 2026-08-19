import pytest
from app.models.models import SystemSettings, FanState
from app.services.automation_service import evaluate_fan_automation

def test_automation_fan_off_below_low_threshold(db_session):
    """Test that fan switches OFF when temp < low_threshold (<25°C)."""
    fan_state = evaluate_fan_automation(db_session, current_temp=22.0)
    assert fan_state.status == "OFF"
    assert fan_state.speed == 0.0
    assert fan_state.mode == "AUTO"

def test_automation_fan_low_speed(db_session):
    """Test that fan switches to LOW (30%) when 25°C <= temp < 30°C."""
    fan_state = evaluate_fan_automation(db_session, current_temp=27.5)
    assert fan_state.status == "ON"
    assert fan_state.speed == 30.0
    assert fan_state.mode == "AUTO"

def test_automation_fan_medium_speed(db_session):
    """Test that fan switches to MEDIUM (60%) when 30°C <= temp < 35°C."""
    fan_state = evaluate_fan_automation(db_session, current_temp=32.0)
    assert fan_state.status == "ON"
    assert fan_state.speed == 60.0
    assert fan_state.mode == "AUTO"

def test_automation_fan_high_speed(db_session):
    """Test that fan switches to HIGH (100%) when temp >= 35°C."""
    fan_state = evaluate_fan_automation(db_session, current_temp=36.4)
    assert fan_state.status == "ON"
    assert fan_state.speed == 100.0
    assert fan_state.mode == "AUTO"

def test_manual_mode_prevents_automation_override(db_session):
    """Test that automation engine respects MANUAL mode and does not override fan speed."""
    # Set manual state
    manual_state = FanState(status="ON", speed=45.0, mode="MANUAL")
    db_session.add(manual_state)
    db_session.commit()

    # Evaluate high temp
    res_state = evaluate_fan_automation(db_session, current_temp=38.0)
    assert res_state.mode == "MANUAL"
    assert res_state.speed == 45.0
