from sqlalchemy import Column, String, DateTime, JSON, ForeignKey, Integer
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid
from app.core.database import Base

class Investigation(Base):
    __tablename__ = "investigations"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    type = Column(String, nullable=False, index=True) # e.g., "URL", "FILE", "IP"
    target = Column(String, nullable=False, index=True) # e.g., "https://example.com"
    status = Column(String, nullable=False, default="PENDING") # PENDING, COMPLETED, FAILED
    threat_score = Column(Integer, nullable=True) # 0-100
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime, nullable=True)
    
    # Store the entire complex result structure as JSON
    result_data = Column(JSON, nullable=True)
    
    user = relationship("User")
