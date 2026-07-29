from pydantic import BaseModel
from typing import Optional, Any, Dict
from datetime import datetime

class AuditLogBase(BaseModel):
    action: str
    resource_type: Optional[str] = None
    resource_id: Optional[str] = None
    details: Optional[Dict[str, Any]] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None

class AuditLogCreate(AuditLogBase):
    user_id: Optional[int] = None

class AuditLogResponse(AuditLogBase):
    id: str
    user_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


class UserSessionBase(BaseModel):
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None

class UserSessionCreate(UserSessionBase):
    user_id: int
    token_signature: str
    expires_at: datetime

class UserSessionResponse(UserSessionBase):
    id: str
    user_id: int
    expires_at: datetime
    is_revoked: bool
    created_at: datetime

    class Config:
        from_attributes = True
