from app.database.session import get_db

# Re-export get_db for API dependency injection
__all__ = ["get_db"]
