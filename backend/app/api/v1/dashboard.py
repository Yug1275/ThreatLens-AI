from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.repositories.investigation_repository import investigation_repository
from app.schemas.investigation import DashboardStats, ActivityDataPoint, RecentInvestigationItem

router = APIRouter()


@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Real aggregate counts from the investigations table."""
    return investigation_repository.get_user_stats(db, user_id=current_user.id)


@router.get("/activity", response_model=List[ActivityDataPoint])
def get_dashboard_activity(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Per-day malicious/safe counts for the last 7 days (chart data)."""
    return investigation_repository.get_weekly_activity(db, user_id=current_user.id)


@router.get("/recent", response_model=List[RecentInvestigationItem])
def get_recent_investigations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Last 10 real investigations for the dashboard table."""
    return investigation_repository.get_recent(db, user_id=current_user.id, limit=10)
