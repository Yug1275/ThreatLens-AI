from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.security import UserSessionResponse, AuditLogResponse
from app.services.security_service import SecurityService

router = APIRouter()

@router.get("/sessions", response_model=List[UserSessionResponse])
def get_sessions(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return SecurityService.get_user_sessions(db, current_user.id)

@router.delete("/sessions/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def revoke_session(session_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    success = SecurityService.revoke_session(db, session_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Session not found or already revoked")
    return None

@router.get("/audit", response_model=List[AuditLogResponse])
def get_audit_logs(skip: int = 0, limit: int = 50, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return SecurityService.get_user_audit_logs(db, current_user.id, limit, skip)
