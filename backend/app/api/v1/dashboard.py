from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.repositories.investigation_repository import investigation_repository
from app.schemas.investigation import (
    DashboardStats, ActivityDataPoint, RecentInvestigationItem,
    RiskDistributionItem, TopTargetItem, TypeDistributionItem, ProductivityDataPoint
)

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


@router.get("/types", response_model=List[TypeDistributionItem])
def get_dashboard_types(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Investigation counts per type."""
    return investigation_repository.get_type_distribution(db, user_id=current_user.id)


@router.get("/risk", response_model=List[RiskDistributionItem])
def get_dashboard_risk(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Risk distribution for pie chart."""
    return investigation_repository.get_risk_distribution(db, user_id=current_user.id)


@router.get("/top-targets", response_model=List[TopTargetItem])
def get_dashboard_top_targets(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Most frequently investigated targets."""
    return investigation_repository.get_top_targets(db, user_id=current_user.id)


@router.get("/productivity", response_model=List[ProductivityDataPoint])
def get_dashboard_productivity(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Analyst productivity over last 30 days."""
    return investigation_repository.get_analyst_productivity(db, user_id=current_user.id)
