from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.notification import Notification, NotificationPreference
from app.schemas.notification import (
    NotificationResponse,
    NotificationCreate,
    NotificationPreferenceResponse,
    NotificationPreferenceUpdate,
)
from app.models.user import User
from app.api.v1.auth import get_current_user

router = APIRouter()

@router.get("/", response_model=List[NotificationResponse])
def get_notifications(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get user's notifications."""
    notifications = (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return notifications

@router.post("/", response_model=NotificationResponse, status_code=status.HTTP_201_CREATED)
def create_notification(
    notification_in: NotificationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a notification (usually done internally, but exposed for testing/admin)."""
    notification = Notification(
        user_id=current_user.id,
        title=notification_in.title,
        message=notification_in.message,
        type=notification_in.type,
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification

@router.patch("/{notification_id}/read", response_model=NotificationResponse)
def mark_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Mark a specific notification as read."""
    notification = (
        db.query(Notification)
        .filter(Notification.id == notification_id, Notification.user_id == current_user.id)
        .first()
    )
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    notification.is_read = True
    db.commit()
    db.refresh(notification)
    return notification

@router.post("/read-all", response_model=dict)
def mark_all_as_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Mark all notifications as read."""
    db.query(Notification).filter(
        Notification.user_id == current_user.id, Notification.is_read == False
    ).update({"is_read": True}, synchronize_session=False)
    db.commit()
    return {"status": "success", "message": "All notifications marked as read"}

@router.get("/preferences", response_model=NotificationPreferenceResponse)
def get_preferences(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get user's notification preferences."""
    prefs = db.query(NotificationPreference).filter(NotificationPreference.user_id == current_user.id).first()
    if not prefs:
        # Create default preferences
        prefs = NotificationPreference(user_id=current_user.id)
        db.add(prefs)
        db.commit()
        db.refresh(prefs)
    return prefs

@router.put("/preferences", response_model=NotificationPreferenceResponse)
def update_preferences(
    prefs_in: NotificationPreferenceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update user's notification preferences."""
    prefs = db.query(NotificationPreference).filter(NotificationPreference.user_id == current_user.id).first()
    if not prefs:
        prefs = NotificationPreference(user_id=current_user.id)
        db.add(prefs)
        
    if prefs_in.email_alerts is not None:
        prefs.email_alerts = prefs_in.email_alerts
    if prefs_in.browser_alerts is not None:
        prefs.browser_alerts = prefs_in.browser_alerts
    if prefs_in.background_monitoring is not None:
        prefs.background_monitoring = prefs_in.background_monitoring

    db.commit()
    db.refresh(prefs)
    return prefs
