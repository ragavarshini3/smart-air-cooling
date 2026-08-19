import os
import logging
import httpx
from typing import Dict, Any
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone

from app.core.config import settings
from app.models.models import SensorReading, FanState, Alert, SystemSettings

logger = logging.getLogger("smart_cooling.ai")

def build_system_context(db: Session) -> str:
    """Builds a structured contextual snapshot of the smart cooling system for Gemini."""
    sys_settings = db.query(SystemSettings).first()
    low_t = sys_settings.low_threshold if sys_settings else 25.0
    med_t = sys_settings.medium_threshold if sys_settings else 30.0
    high_t = sys_settings.high_threshold if sys_settings else 35.0
    sim_mode = sys_settings.simulation_mode if sys_settings else "Normal"
    sys_name = sys_settings.system_name if sys_settings else "Smart Workspace Zone A"

    latest_sensor = db.query(SensorReading).order_by(SensorReading.timestamp.desc()).first()
    curr_temp = latest_sensor.temperature if latest_sensor else 25.0
    curr_hum = latest_sensor.humidity if latest_sensor else 50.0

    latest_fan = db.query(FanState).order_by(FanState.timestamp.desc()).first()
    fan_status = latest_fan.status if latest_fan else "OFF"
    fan_speed = latest_fan.speed if latest_fan else 0.0
    op_mode = latest_fan.mode if latest_fan else "AUTO"

    now = datetime.now(timezone.utc)
    today_start = datetime(now.year, now.month, now.day, tzinfo=timezone.utc)
    today_readings = db.query(SensorReading).filter(SensorReading.timestamp >= today_start).all()

    if today_readings:
        temps = [r.temperature for r in today_readings]
        max_temp_today = max(temps)
        min_temp_today = min(temps)
        avg_temp_today = sum(temps) / len(temps)
    else:
        max_temp_today = min_temp_today = avg_temp_today = curr_temp

    active_alerts = db.query(Alert).filter(Alert.resolved == False).order_by(Alert.timestamp.desc()).all()
    alert_info = ""
    if active_alerts:
        alert_info = f"ACTIVE ALERTS ({len(active_alerts)}): " + "; ".join([f"[{a.severity}] {a.message}" for a in active_alerts])
    else:
        alert_info = "ACTIVE ALERTS: None (System operates normally)."

    context = f"""
SYSTEM SNAPSHOT ({sys_name}):
- System Operational Status: ONLINE (Simulation Mode: {sim_mode})
- Current Temperature: {curr_temp:.1f}°C
- Current Relative Humidity: {curr_hum:.1f}%
- Fan Status: {fan_status} (Speed: {fan_speed:.0f}%)
- System Mode: {op_mode}
- Configured Temperature Thresholds:
  * Low Threshold (< {low_t}°C): Fan OFF (0%)
  * Medium Threshold ({low_t}°C - {med_t}°C): Fan LOW (30%)
  * High Threshold ({med_t}°C - {high_t}°C): Fan MEDIUM (60%)
  * Thermal Limit (>= {high_t}°C): Fan HIGH (100%)
- Today's Thermal Summary:
  * Peak Temperature Today: {max_temp_today:.1f}°C
  * Minimum Temperature Today: {min_temp_today:.1f}°C
  * Average Temperature Today: {avg_temp_today:.1f}°C
- {alert_info}
"""
    return context.strip()

def generate_ai_response(user_message: str, db: Session) -> str:
    """Invokes Google Gemini API with system context to answer user queries."""
    api_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY", "")
    
    context_str = build_system_context(db)

    system_instruction = (
        "You are the official AI Cooling Assistant for an IoT-Enabled Smart Air-Cooling System. "
        "Your duty is to answer questions regarding the smart workspace cooling status, fan behavior, "
        "temperature/humidity readings, threshold rules, and thermal optimization. "
        "STRICT RULES:\n"
        "1. Always ground your answer strictly in the REAL system metrics provided in the system snapshot context below.\n"
        "2. If the user asks why the fan is running or at a specific speed, explain using the current temperature relative to configured thresholds.\n"
        "3. If the user asks an off-topic question unrelated to the smart cooling management system (e.g. general knowledge, trivia, coding), "
        "politely explain that your assistant focus is dedicated to smart workspace climate monitoring.\n"
        "4. Be professional, clear, concise, and helpful."
    )

    prompt = f"{system_instruction}\n\n[SYSTEM CONTEXT DATA]\n{context_str}\n\n[USER QUESTION]\n{user_message}"

    if not api_key:
        return (
            f"I have analyzed your request based on current system metrics:\n\n"
            f"**System Status Snapshot**:\n"
            f"{context_str}\n\n"
            f"*(Note: To enable live conversational AI with Gemini, please add your GEMINI_API_KEY to backend/.env file).* "
        )

    # 1. Try google-genai SDK if available
    try:
        from google import genai
        client = genai.Client(api_key=api_key)
        for model_name in ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"]:
            try:
                res = client.models.generate_content(
                    model=model_name,
                    contents=prompt
                )
                if res and res.text:
                    return res.text.strip()
            except Exception as e:
                logger.debug(f"SDK model {model_name} failed: {e}")
    except Exception:
        pass

    # 2. Try google.generativeai SDK if available
    try:
        import google.generativeai as genai_old
        genai_old.configure(api_key=api_key)
        for model_name in ["gemini-1.5-flash", "gemini-pro", "gemini-1.0-pro"]:
            try:
                m = genai_old.GenerativeModel(model_name)
                res = m.generate_content(prompt)
                if res and res.text:
                    return res.text.strip()
            except Exception as e:
                logger.debug(f"Legacy SDK model {model_name} failed: {e}")
    except Exception:
        pass

    # 3. Direct REST HTTP API Fallback across models
    candidate_models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"]
    payload = {
        "contents": [
            {
                "parts": [{"text": prompt}]
            }
        ]
    }

    last_error = ""
    with httpx.Client(timeout=15.0) as client:
        for model in candidate_models:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
            try:
                response = client.post(url, json=payload)
                if response.status_code == 200:
                    res_data = response.json()
                    candidates = res_data.get("candidates", [])
                    if candidates:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        if parts and "text" in parts[0]:
                            return parts[0]["text"].strip()
                else:
                    last_error = f"HTTP {response.status_code}: {response.text}"
            except Exception as http_err:
                last_error = str(http_err)

    logger.error(f"Gemini API invocation failed: {last_error}")
    return (
        f"Based on live system context:\n\n{context_str}\n\n"
        f"*(Note: Gemini API returned connection error: {last_error}. Please verify your API key in `backend/.env`).*"
    )
