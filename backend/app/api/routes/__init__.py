from fastapi import APIRouter
from app.api.routes.health import router as health_router
from app.api.routes.dashboard import router as dashboard_router
from app.api.routes.sensor import router as sensor_router
from app.api.routes.fan import router as fan_router
from app.api.routes.settings import router as settings_router
from app.api.routes.alerts import router as alerts_router
from app.api.routes.analytics import router as analytics_router
from app.api.routes.ai import router as ai_router

api_router = APIRouter()
api_router.include_router(health_router, tags=["Health"])
api_router.include_router(dashboard_router, tags=["Dashboard"])
api_router.include_router(sensor_router, tags=["Sensor"])
api_router.include_router(fan_router, tags=["Fan & Controls"])
api_router.include_router(settings_router, tags=["Settings & Simulation"])
api_router.include_router(alerts_router, tags=["Alerts"])
api_router.include_router(analytics_router, tags=["Analytics"])
api_router.include_router(ai_router, tags=["AI Assistant"])
