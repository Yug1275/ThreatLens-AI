from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import List

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.investigation import Investigation
from app.services.url_investigator import URLInvestigatorService
from app.services.ocr_investigator import OCRInvestigatorService
from app.services.qr_investigator import QRInvestigatorService
from app.services.email_investigator import EmailInvestigatorService
from app.services.phone_investigator import PhoneInvestigatorService
from pydantic import BaseModel

router = APIRouter()

class URLSubmission(BaseModel):
    url: str

class EmailSubmission(BaseModel):
    raw_headers: str = None
    sender_email: str = None
    subject: str = None
    body: str = None

class PhoneSubmission(BaseModel):
    phone_number: str

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

@router.post("/ocr")
async def submit_ocr_investigation(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded")
        
    file_bytes = await file.read()
    
    try:
        results = OCRInvestigatorService.analyze(file_bytes)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
    inv = Investigation(
        user_id=current_user.id,
        type="OCR",
        target=file.filename,
        status="COMPLETED",
        threat_score=results.get("threat_score", 0),
        completed_at=datetime.now(timezone.utc),
        result_data=results
    )
    db.add(inv)
    db.commit()
    db.refresh(inv)
    
    return inv

@router.post("/qr")
async def submit_qr_investigation(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded")
        
    file_bytes = await file.read()
    
    try:
        results = QRInvestigatorService.analyze(file_bytes)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
    inv = Investigation(
        user_id=current_user.id,
        type="QR",
        target=file.filename,
        status="COMPLETED",
        threat_score=results.get("threat_score", 0),
        completed_at=datetime.now(timezone.utc),
        result_data=results
    )
    db.add(inv)
    db.commit()
    db.refresh(inv)
    
    return inv

@router.post("/email")
def submit_email_investigation(
    submission: EmailSubmission,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not submission.raw_headers and not (submission.sender_email and submission.body):
        raise HTTPException(status_code=400, detail="Must provide either raw_headers or structured email fields")
        
    try:
        results = EmailInvestigatorService.analyze(
            raw_headers=submission.raw_headers,
            sender_email=submission.sender_email,
            subject=submission.subject,
            body=submission.body
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
    inv = Investigation(
        user_id=current_user.id,
        type="EMAIL",
        target="Raw Headers" if submission.raw_headers else f"Structured: {submission.sender_email}",
        status="COMPLETED",
        threat_score=results.get("threat_score", 0),
        completed_at=datetime.now(timezone.utc),
        result_data=results
    )
    db.add(inv)
    db.commit()
    db.refresh(inv)
    
    return inv

    return inv

@router.post("/phone")
def submit_phone_investigation(
    submission: PhoneSubmission,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not submission.phone_number:
        raise HTTPException(status_code=400, detail="No phone number provided")
        
    try:
        results = PhoneInvestigatorService.analyze(submission.phone_number)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
    inv = Investigation(
        user_id=current_user.id,
        type="PHONE",
        target=submission.phone_number,
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
