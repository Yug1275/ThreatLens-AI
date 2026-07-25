from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import List

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.investigation import Investigation
from app.services.url_investigator import URLInvestigatorService
from pydantic import BaseModel

router = APIRouter()

class URLSubmission(BaseModel):
    url: str

@router.post("/url")
def submit_url_investigation(
    submission: URLSubmission,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not URLInvestigatorService.is_valid_url(submission.url):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid URL format"
        )
        
    # Perform mock investigation synchronously for Phase 4A
    try:
        results = URLInvestigatorService.analyze(submission.url)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
    # Create DB record
    inv = Investigation(
        user_id=current_user.id,
        type="URL",
        target=submission.url,
        status="COMPLETED",
        threat_score=results.get("threat_score", 0),
        completed_at=datetime.now(timezone.utc),
        result_data=results
    )
    db.add(inv)
    db.commit()
    db.refresh(inv)
    
    return inv

@router.get("/")
def get_user_investigations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 20
):
    invs = db.query(Investigation).filter(
        Investigation.user_id == current_user.id
    ).order_by(Investigation.created_at.desc()).limit(limit).all()
    
    return invs

@router.get("/{investigation_id}")
def get_investigation(
    investigation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    inv = db.query(Investigation).filter(
        Investigation.id == investigation_id,
        Investigation.user_id == current_user.id
    ).first()
    
    if not inv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Investigation not found"
        )
    return inv
