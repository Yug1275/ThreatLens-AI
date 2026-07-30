from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.services.monitoring_service import monitoring_service
from sqlalchemy import text

router = APIRouter()

@router.get("/health")
def health_check():
    """Simple status endpoint to verify the service is running."""
    return {"status": "ok"}

@router.get("/metrics")
def get_metrics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns full observability metrics. 
    Restricted to authenticated users (and in a real app, Admin roles).
    """
    
    # Check DB connection
    db_status = "healthy"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = "unhealthy"
        monitoring_service.record_exception("db_check", "GET", str(e))
        
    return {
        "system": monitoring_service.get_system_metrics(),
        "api": monitoring_service.get_api_metrics(),
        "errors": monitoring_service.get_recent_errors(),
        "services": {
            "database": db_status,
            "background_tasks": "healthy", # Assuming healthy for MVP
            "redis_cache": "disabled" # Not configured
        }
    }
