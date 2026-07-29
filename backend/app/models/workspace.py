from sqlalchemy import Column, String, DateTime, JSON, ForeignKey, Integer
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid
from app.core.database import Base

class WorkspaceFolder(Base):
    __tablename__ = "workspace_folders"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User")
    # investigations will have a foreign key to this

class SavedSearch(Base):
    __tablename__ = "saved_searches"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    query_string = Column(String, nullable=True)
    filters = Column(JSON, nullable=True) # e.g. {"status": "PENDING", "type": "URL"}
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User")
