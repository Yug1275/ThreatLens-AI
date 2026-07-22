from fastapi import APIRouter, Depends
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/stats")
def get_dashboard_stats(current_user: User = Depends(get_current_user)):
    return {
        "total": 124,
        "malicious": 12,
        "safe": 98,
        "pending": 14
    }

@router.get("/activity")
def get_dashboard_activity(current_user: User = Depends(get_current_user)):
    return [
        {"name": "Mon", "malicious": 4, "safe": 20},
        {"name": "Tue", "malicious": 3, "safe": 15},
        {"name": "Wed", "malicious": 8, "safe": 30},
        {"name": "Thu", "malicious": 2, "safe": 25},
        {"name": "Fri", "malicious": 5, "safe": 35},
        {"name": "Sat", "malicious": 1, "safe": 10},
        {"name": "Sun", "malicious": 2, "safe": 12},
    ]

@router.get("/recent")
def get_recent_investigations(current_user: User = Depends(get_current_user)):
    return [
        {"id": "INV-7829", "target": "suspicious-login.com", "type": "URL", "status": "MALICIOUS", "date": "2h ago", "severity": "High"},
        {"id": "INV-7828", "target": "invoice_attachment.pdf", "type": "File", "status": "SAFE", "date": "4h ago", "severity": "Low"},
        {"id": "INV-7827", "target": "192.168.1.105", "type": "IP", "status": "PENDING", "date": "5h ago", "severity": "Medium"},
        {"id": "INV-7826", "target": "crypto-giveaway.net", "type": "URL", "status": "MALICIOUS", "date": "1d ago", "severity": "High"}
    ]
