import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.api.routes import api_router
from app.services.system_service import init_db
from app.simulation.engine import simulation_engine

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("smart_cooling.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing Smart Air-Cooling Application...")
    init_db()
    logger.info("Database initialized successfully.")
    
    # Start background software simulation engine
    simulation_engine.start()
    logger.info("Background environmental simulation engine initiated.")
    
    yield
    
    simulation_engine.stop()
    logger.info("Shutting down Smart Air-Cooling Application.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "message": "Welcome to IoT-Enabled Smart Air-Cooling System API",
        "docs": "/docs",
        "health": f"{settings.API_V1_STR}/health"
    }
