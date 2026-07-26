import math
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.repositories.investigation_repository import investigation_repository
from app.schemas.investigation import InvestigationResponse, InvestigationListResponse
from app.services.url_investigator import URLInvestigatorService
from app.services.ocr_investigator import OCRInvestigatorService
from app.services.qr_investigator import QRInvestigatorService
from app.services.email_investigator import EmailInvestigatorService
from app.services.phone_investigator import PhoneInvestigatorService
from pydantic import BaseModel

router = APIRouter()


# ── Request schemas ─────────────────────────────────────────────────── #

class URLSubmission(BaseModel):
    url: str


class EmailSubmission(BaseModel):
    raw_headers: Optional[str] = None
    sender_email: Optional[str] = None
    subject: Optional[str] = None
    body: Optional[str] = None


class PhoneSubmission(BaseModel):
    phone_number: str


# ── POST — Submit investigations ─────────────────────────────────────── #

@router.post("/url", response_model=InvestigationResponse, status_code=status.HTTP_201_CREATED)
def submit_url_investigation(
    submission: URLSubmission,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not URLInvestigatorService.is_valid_url(submission.url):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid URL format")

    try:
        results = URLInvestigatorService.analyze(submission.url)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    inv = investigation_repository.create(
        db,
        user_id=current_user.id,
        inv_type="URL",
        target=submission.url,
        threat_score=results.get("threat_score", 0),
        result_data=results,
    )
    return inv


@router.post("/ocr", response_model=InvestigationResponse, status_code=status.HTTP_201_CREATED)
async def submit_ocr_investigation(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded")

    file_bytes = await file.read()
    try:
        results = OCRInvestigatorService.analyze(file_bytes)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    inv = investigation_repository.create(
        db,
        user_id=current_user.id,
        inv_type="OCR",
        target=file.filename,
        threat_score=results.get("threat_score", 0),
        result_data=results,
    )
    return inv


@router.post("/qr", response_model=InvestigationResponse, status_code=status.HTTP_201_CREATED)
async def submit_qr_investigation(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded")

    file_bytes = await file.read()
    try:
        results = QRInvestigatorService.analyze(file_bytes)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    inv = investigation_repository.create(
        db,
        user_id=current_user.id,
        inv_type="QR",
        target=file.filename,
        threat_score=results.get("threat_score", 0),
        result_data=results,
    )
    return inv


@router.post("/email", response_model=InvestigationResponse, status_code=status.HTTP_201_CREATED)
def submit_email_investigation(
    submission: EmailSubmission,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not submission.raw_headers and not (submission.sender_email and submission.body):
        raise HTTPException(
            status_code=400,
            detail="Must provide either raw_headers or structured email fields (sender_email + body)",
        )

    try:
        results = EmailInvestigatorService.analyze(
            raw_headers=submission.raw_headers,
            sender_email=submission.sender_email,
            subject=submission.subject,
            body=submission.body,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    target = "Raw Headers" if submission.raw_headers else f"Structured: {submission.sender_email}"
    inv = investigation_repository.create(
        db,
        user_id=current_user.id,
        inv_type="EMAIL",
        target=target,
        threat_score=results.get("threat_score", 0),
        result_data=results,
    )
    return inv


@router.post("/phone", response_model=InvestigationResponse, status_code=status.HTTP_201_CREATED)
def submit_phone_investigation(
    submission: PhoneSubmission,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not submission.phone_number:
        raise HTTPException(status_code=400, detail="No phone number provided")

    try:
        results = PhoneInvestigatorService.analyze(submission.phone_number)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    inv = investigation_repository.create(
        db,
        user_id=current_user.id,
        inv_type="PHONE",
        target=submission.phone_number,
        threat_score=results.get("threat_score", 0),
        result_data=results,
    )
    return inv


# ── GET — List investigations (paginated + filtered) ──────────────────── #

@router.get("/", response_model=InvestigationListResponse)
def get_user_investigations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    type: Optional[str] = Query(default=None, description="Filter by type: URL, OCR, QR, EMAIL, PHONE"),
    status: Optional[str] = Query(default=None, description="Filter by status: COMPLETED, FAILED, PENDING"),
    search: Optional[str] = Query(default=None, description="Search by target"),
    sort_by: Optional[str] = Query(default="created_at", description="Sort field (e.g. created_at, threat_score, target, type)"),
    sort_order: Optional[str] = Query(default="desc", description="Sort order: asc or desc"),
):
    skip = (page - 1) * limit
    items, total = investigation_repository.get_user_investigations(
        db, user_id=current_user.id, skip=skip, limit=limit, inv_type=type, status=status,
        search=search, sort_by=sort_by, sort_order=sort_order
    )
    pages = math.ceil(total / limit) if total > 0 else 1
    return InvestigationListResponse(items=items, total=total, page=page, pages=pages, limit=limit)


# ── GET — Single investigation by ID ─────────────────────────────────── #

@router.get("/{investigation_id}", response_model=InvestigationResponse)
def get_investigation(
    investigation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    inv = investigation_repository.get_by_id(db, investigation_id, current_user.id)
    if not inv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Investigation not found")
    return inv


# ── DELETE — Soft-delete ─────────────────────────────────────────────── #

@router.delete("/{investigation_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_investigation(
    investigation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    deleted = investigation_repository.soft_delete(db, investigation_id, current_user.id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Investigation not found")
