from pydantic import BaseModel
from typing import Optional, Any, List
from datetime import datetime


class InvestigationResponse(BaseModel):
    """Serializes a single Investigation record for API consumers."""
    id: str
    user_id: int
    type: str
    target: str
    status: str
    threat_score: Optional[int] = None
    result_data: Optional[Any] = None
    created_at: datetime
    completed_at: Optional[datetime] = None
    is_deleted: bool = False

    class Config:
        from_attributes = True


class InvestigationListResponse(BaseModel):
    """Paginated list response for investigation history."""
    items: List[InvestigationResponse]
    total: int
    page: int
    pages: int
    limit: int


class DashboardStats(BaseModel):
    """Aggregate counts for the dashboard stat cards."""
    total: int
    malicious: int
    safe: int
    suspicious: int
    pending: int
    average_score: float = 0.0


class ActivityDataPoint(BaseModel):
    """Single day entry for the threat-activity area chart."""
    name: str       # e.g. "Mon", "Tue"
    malicious: int
    safe: int


class RecentInvestigationItem(BaseModel):
    """Compact investigation summary for the dashboard recent-activity table."""
    id: str
    target: str
    type: str
    status: str
    threat_score: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True
