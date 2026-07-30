from sqlalchemy import Column, String, DateTime, JSON, ForeignKey, Integer, Boolean, Index
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid
from app.core.database import Base

class Investigation(Base):
    __tablename__ = "investigations"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    type = Column(String, nullable=False, index=True)     # e.g., "URL", "OCR", "QR", "EMAIL", "PHONE"
    target = Column(String, nullable=False, index=True)   # e.g., "https://example.com"
    status = Column(String, nullable=False, default="PENDING", index=True)  # PENDING, COMPLETED, FAILED
    threat_score = Column(Integer, nullable=True)          # 0-100

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    completed_at = Column(DateTime, nullable=True)

    # Raw investigator output — the complete result JSON from each service
    result_data = Column(JSON, nullable=True)

    # Soft-delete flag — hides from user without permanent removal
    is_deleted = Column(Boolean, default=False, nullable=False, index=True)
    
    # Workspace organization (Phase 6D)
    folder_id = Column(String, ForeignKey("workspace_folders.id", ondelete="SET NULL"), nullable=True)
    workflow_status = Column(String, nullable=False, default="NEW")  # NEW, IN_PROGRESS, RESOLVED, CLOSED
    
    # Metadata for management (Phase 5D)
    name = Column(String, nullable=True)
    notes = Column(String, nullable=True)
    tags = Column(JSON, nullable=True)
    is_favorite = Column(Boolean, default=False, nullable=False)
    is_archived = Column(Boolean, default=False, nullable=False)

    user = relationship("User")

    __table_args__ = (
        Index('ix_investigations_user_status_deleted', 'user_id', 'status', 'is_deleted'),
        Index('ix_investigations_user_created_at', 'user_id', 'created_at'),
    )
