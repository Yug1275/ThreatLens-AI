from sqlalchemy.orm import Session
from fastapi import Request
from app.models.security import UserSession, AuditLog
from app.schemas.security import UserSessionCreate, AuditLogCreate
import hashlib

class SecurityService:
    @staticmethod
    def create_session(db: Session, session_in: UserSessionCreate):
        session = UserSession(**session_in.model_dump())
        db.add(session)
        db.commit()
        db.refresh(session)
        return session

    @staticmethod
    def get_session_by_signature(db: Session, signature: str):
        return db.query(UserSession).filter(UserSession.token_signature == signature).first()

    @staticmethod
    def revoke_session(db: Session, session_id: str, user_id: int):
        session = db.query(UserSession).filter(
            UserSession.id == session_id,
            UserSession.user_id == user_id
        ).first()
        if session:
            session.is_revoked = True
            db.commit()
            return True
        return False

    @staticmethod
    def get_user_sessions(db: Session, user_id: int):
        return db.query(UserSession).filter(
            UserSession.user_id == user_id,
            UserSession.is_revoked == False
        ).order_by(UserSession.created_at.desc()).all()

    @staticmethod
    def create_audit_log(db: Session, log_in: AuditLogCreate):
        log = AuditLog(**log_in.model_dump())
        db.add(log)
        db.commit()
        return log
        
    @staticmethod
    def get_user_audit_logs(db: Session, user_id: int, limit: int = 50, skip: int = 0):
        return db.query(AuditLog).filter(
            AuditLog.user_id == user_id
        ).order_by(AuditLog.created_at.desc()).offset(skip).limit(limit).all()

def log_audit(db: Session, user_id: int, action: str, resource_type: str = None, resource_id: str = None, details: dict = None, request: Request = None):
    ip_address = None
    user_agent = None
    if request:
        ip_address = request.client.host if request.client else None
        user_agent = request.headers.get("user-agent")

    SecurityService.create_audit_log(db, AuditLogCreate(
        user_id=user_id,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        details=details,
        ip_address=ip_address,
        user_agent=user_agent
    ))
