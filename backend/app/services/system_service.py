import logging
from sqlalchemy.orm import Session
from app.models.models import SystemSettings, FanState, SensorReading, Alert, Base
from app.database.session import engine, SessionLocal

logger = logging.getLogger("smart_cooling.service")

def init_db():
    """Create tables if not exist and seed initial configuration."""
    try:
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        try:
            # Seed default system settings
            settings = db.query(SystemSettings).first()
            if not settings:
                settings = SystemSettings(
                    low_threshold=25.0,
                    medium_threshold=30.0,
                    high_threshold=35.0,
                    simulation_interval=2,
                    simulation_mode="Normal",
                    system_name="Smart Workspace Zone A"
                )
                db.add(settings)
                db.commit()
                logger.info("Seeded initial SystemSettings.")

            # Seed default fan state
            fan_state = db.query(FanState).first()
            if not fan_state:
                fan_state = FanState(
                    status="OFF",
                    speed=0.0,
                    mode="AUTO"
                )
                db.add(fan_state)
                db.commit()
                logger.info("Seeded initial FanState.")

            # Seed initial sensor reading if empty
            sensor_reading = db.query(SensorReading).first()
            if not sensor_reading:
                initial_sensor = SensorReading(
                    temperature=24.5,
                    humidity=55.0
                )
                db.add(initial_sensor)
                db.commit()
                logger.info("Seeded initial SensorReading.")

        finally:
            db.close()
    except Exception as e:
        logger.error(f"Error initializing database: {e}")
