from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

# Notifications
class NotificationBase(BaseModel):
    title: str
    message: str
    type: str = "info"

class NotificationCreate(NotificationBase):
    pass

class NotificationResponse(NotificationBase):
    id: int
    user_id: int
    is_read: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Preferences
class NotificationPreferenceBase(BaseModel):
    email_alerts: Optional[bool] = None
    browser_alerts: Optional[bool] = None
    background_monitoring: Optional[bool] = None

class NotificationPreferenceUpdate(NotificationPreferenceBase):
    pass

class NotificationPreferenceResponse(NotificationPreferenceBase):
    id: int
    user_id: int
    email_alerts: bool
    browser_alerts: bool
    background_monitoring: bool

    model_config = ConfigDict(from_attributes=True)
