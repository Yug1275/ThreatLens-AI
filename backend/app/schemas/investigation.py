from pydantic import BaseModel, ConfigDict
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
    
    name: Optional[str] = None
    notes: Optional[str] = None
    tags: Optional[List[str]] = None
    is_favorite: bool = False
    is_archived: bool = False
    
    # Workspace organization
    folder_id: Optional[str] = None
    workflow_status: str = "NEW"

    model_config = ConfigDict(from_attributes=True)


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

    model_config = ConfigDict(from_attributes=True)


class InvestigationUpdate(BaseModel):
    """Payload for updating metadata of an investigation."""
    name: Optional[str] = None
    notes: Optional[str] = None
    tags: Optional[List[str]] = None
    is_favorite: Optional[bool] = None
    is_archived: Optional[bool] = None
    folder_id: Optional[str] = None
    workflow_status: Optional[str] = None


class BulkActionRequest(BaseModel):
    """Payload for batch actions (delete, update_folder, update_status, archive)."""
    action: str  # 'delete', 'update_folder', 'update_status', 'archive', 'unarchive'
    ids: List[str]
    folder_id: Optional[str] = None
    workflow_status: Optional[str] = None


class RiskDistributionItem(BaseModel):
    name: str
    value: int


class TopTargetItem(BaseModel):
    target: str
    count: int


class TypeDistributionItem(BaseModel):
    name: str
    value: int


class ProductivityDataPoint(BaseModel):
    date: str
    count: int


class IOCItem(BaseModel):
    """Aggregated IOC from investigations table."""
    target: str
    type: str
    occurrence_count: int
    first_seen: datetime
    last_seen: datetime
    max_threat_score: Optional[int] = None


class IOCListResponse(BaseModel):
    items: List[IOCItem]
    total: int
    page: int
    pages: int
    limit: int


class IOCDetail(BaseModel):
    ioc: IOCItem
    investigations: List[RecentInvestigationItem]
