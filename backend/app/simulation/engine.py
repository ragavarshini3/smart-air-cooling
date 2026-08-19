import time
import math
import random
import logging
import threading
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from app.database.session import SessionLocal
from app.models.models import SensorReading, FanState, SystemSettings
from app.services.automation_service import evaluate_fan_automation
from app.services.alert_service import evaluate_temperature_alerts

logger = logging.getLogger("smart_cooling.simulation")

class SimulationEngine:
    def __init__(self):
        self._running = False
        self._thread = None
        self._step_counter = 0
        self._current_temp = 24.5
        self._current_hum = 55.0

    def start(self):
        if self._running:
            logger.info("Simulation engine is already running.")
            return
        self._running = True
        self._thread = threading.Thread(target=self._run_loop, daemon=True, name="SimulationWorker")
        self._thread.start()
        logger.info("Simulation engine background thread started.")

    def stop(self):
        if not self._running:
            return
        self._running = False
        if self._thread and self._thread.is_alive():
            self._thread.join(timeout=3)
        logger.info("Simulation engine stopped.")

    def is_running(self) -> bool:
        return self._running

    def _run_loop(self):
        logger.info("Entering simulation step loop.")
        while self._running:
            try:
                db: Session = SessionLocal()
                try:
                    self._step(db)
                finally:
                    db.close()
            except Exception as e:
                logger.error(f"Error in simulation loop step: {e}")

            # Fetch interval from settings
            interval = 2
            try:
                db_temp = SessionLocal()
                settings = db_temp.query(SystemSettings).first()
                if settings and settings.simulation_interval > 0:
                    interval = settings.simulation_interval
                db_temp.close()
            except Exception:
                pass

            time.sleep(max(1, interval))

    def _step(self, db: Session):
        self._step_counter += 1

        # Fetch latest system settings and fan state
        settings = db.query(SystemSettings).first()
        mode = settings.simulation_mode if settings else "Normal"
        
        latest_fan = db.query(FanState).order_by(FanState.timestamp.desc()).first()
        fan_speed = latest_fan.speed if (latest_fan and latest_fan.status == "ON") else 0.0

        # Fetch last recorded sensor reading if initialized
        last_sensor = db.query(SensorReading).order_by(SensorReading.timestamp.desc()).first()
        if last_sensor:
            self._current_temp = last_sensor.temperature
            self._current_hum = last_sensor.humidity

        # Calculate thermal delta based on environmental mode
        ambient_delta = 0.0
        if mode == "Normal":
            # Gentle sinusoidal ambient oscillation (24.0°C - 27.5°C)
            target_ambient = 25.5 + 1.5 * math.sin(self._step_counter * 0.1)
            ambient_delta = (target_ambient - self._current_temp) * 0.1
        elif mode == "Warm":
            ambient_delta = 0.45 + random.uniform(-0.1, 0.1)
        elif mode == "Hot":
            ambient_delta = 0.85 + random.uniform(-0.15, 0.15)
        elif mode == "Cooling Down":
            ambient_delta = -0.65 + random.uniform(-0.1, 0.1)

        # Cooling effect from active fan
        # Fan speed 100% gives cooling effect of ~ -1.1°C per step
        cooling_effect = (fan_speed / 100.0) * 1.1

        # Net temperature change
        temp_change = ambient_delta - cooling_effect
        
        # Micro variation noise for realism
        micro_noise = random.uniform(-0.05, 0.05)
        new_temp = max(16.0, min(45.0, self._current_temp + temp_change + micro_noise))

        # Humidity calculation (inverse relation to temperature)
        target_hum = max(35.0, min(80.0, 75.0 - (new_temp - 20.0) * 1.8 + math.cos(self._step_counter * 0.05) * 3.0))
        hum_change = (target_hum - self._current_hum) * 0.15
        new_hum = max(30.0, min(85.0, self._current_hum + hum_change))

        # Save new sensor reading to DB
        new_reading = SensorReading(
            temperature=round(new_temp, 2),
            humidity=round(new_hum, 2),
            timestamp=datetime.now(timezone.utc)
        )
        db.add(new_reading)
        db.commit()

        self._current_temp = new_temp
        self._current_hum = new_hum

        # Execute Automation Logic (adjusts Fan state if AUTO)
        evaluate_fan_automation(db, new_temp)

        # Execute Alert Engine Logic
        evaluate_temperature_alerts(db, new_temp)

# Global singleton instance
simulation_engine = SimulationEngine()
