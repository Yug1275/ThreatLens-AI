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
from app.utils.cache import dashboard_cache

router = APIRouter()


@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Real aggregate counts from the investigations table."""
    cache_key = f"stats_{current_user.id}"
    cached_data = dashboard_cache.get(cache_key)
    if cached_data is not None:
        return cached_data
        
    data = investigation_repository.get_user_stats(db, user_id=current_user.id)
    dashboard_cache.set(cache_key, data)
    return data


@router.get("/activity", response_model=List[ActivityDataPoint])
def get_dashboard_activity(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Per-day malicious/safe counts for the last 7 days (chart data)."""
    cache_key = f"activity_{current_user.id}"
    cached_data = dashboard_cache.get(cache_key)
    if cached_data is not None:
        return cached_data
        
    data = investigation_repository.get_weekly_activity(db, user_id=current_user.id)
    dashboard_cache.set(cache_key, data)
    return data


@router.get("/recent", response_model=List[RecentInvestigationItem])
def get_recent_investigations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Last 10 real investigations for the dashboard table."""
    # We might not want to cache recent items too long, but for consistency let's cache it.
    cache_key = f"recent_{current_user.id}"
    cached_data = dashboard_cache.get(cache_key)
    if cached_data is not None:
        return cached_data
        
    data = investigation_repository.get_recent(db, user_id=current_user.id, limit=10)
    dashboard_cache.set(cache_key, data)
    return data


@router.get("/types", response_model=List[TypeDistributionItem])
def get_dashboard_types(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Investigation counts per type."""
    cache_key = f"types_{current_user.id}"
    cached_data = dashboard_cache.get(cache_key)
    if cached_data is not None:
        return cached_data
        
    data = investigation_repository.get_type_distribution(db, user_id=current_user.id)
    dashboard_cache.set(cache_key, data)
    return data


@router.get("/risk", response_model=List[RiskDistributionItem])
def get_dashboard_risk(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Risk distribution for pie chart."""
    cache_key = f"risk_{current_user.id}"
    cached_data = dashboard_cache.get(cache_key)
    if cached_data is not None:
        return cached_data
        
    data = investigation_repository.get_risk_distribution(db, user_id=current_user.id)
    dashboard_cache.set(cache_key, data)
    return data


@router.get("/top-targets", response_model=List[TopTargetItem])
def get_dashboard_top_targets(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Most frequently investigated targets."""
    cache_key = f"top_targets_{current_user.id}"
    cached_data = dashboard_cache.get(cache_key)
    if cached_data is not None:
        return cached_data
        
    data = investigation_repository.get_top_targets(db, user_id=current_user.id)
    dashboard_cache.set(cache_key, data)
    return data


@router.get("/productivity", response_model=List[ProductivityDataPoint])
def get_dashboard_productivity(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Analyst productivity over last 30 days."""
    cache_key = f"productivity_{current_user.id}"
    cached_data = dashboard_cache.get(cache_key)
    if cached_data is not None:
        return cached_data
        
    data = investigation_repository.get_analyst_productivity(db, user_id=current_user.id)
    dashboard_cache.set(cache_key, data)
    return data
