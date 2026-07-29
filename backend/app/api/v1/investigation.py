import math
import io
import csv
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import Optional

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.repositories.investigation_repository import investigation_repository
from app.repositories.investigation_repository import investigation_repository
from app.schemas.investigation import InvestigationResponse, InvestigationListResponse, InvestigationUpdate, BulkDeleteRequest, BulkActionRequest
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
    is_favorite: Optional[bool] = Query(default=None, description="Filter by favorite status"),
    is_archived: Optional[bool] = Query(default=False, description="Filter by archived status"),
    folder_id: Optional[str] = Query(default=None, description="Filter by folder ID"),
    workflow_status: Optional[str] = Query(default=None, description="Filter by workflow status"),
):
    skip = (page - 1) * limit
    items, total = investigation_repository.get_user_investigations(
        db, user_id=current_user.id, skip=skip, limit=limit, inv_type=type, status=status,
        search=search, sort_by=sort_by, sort_order=sort_order, is_favorite=is_favorite, is_archived=is_archived,
        folder_id=folder_id, workflow_status=workflow_status
    )
    pages = math.ceil(total / limit) if total > 0 else 1
    return InvestigationListResponse(items=items, total=total, page=page, pages=pages, limit=limit)


# ── GET — Export investigations ───────────────────────────────────────── #

@router.get("/export")
def export_investigations(
    format: str = Query(default="json", description="Export format: csv or json"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    items, _ = investigation_repository.get_user_investigations(
        db, user_id=current_user.id, skip=0, limit=10000, status="COMPLETED"
    )
    
    if format.lower() == "csv":
        stream = io.StringIO()
        writer = csv.writer(stream)
        writer.writerow(["ID", "Target", "Type", "Status", "Threat Score", "Created At"])
        for item in items:
            writer.writerow([
                item.id,
                item.target,
                item.type,
                item.status,
                item.threat_score,
                item.created_at.isoformat() if item.created_at else ""
            ])
        
        response = StreamingResponse(iter([stream.getvalue()]), media_type="text/csv")
        response.headers["Content-Disposition"] = "attachment; filename=investigations_export.csv"
        return response
    
    elif format.lower() == "json":
        import json
        data = []
        for item in items:
            data.append({
                "id": item.id,
                "target": item.target,
                "type": item.type,
                "status": item.status,
                "threat_score": item.threat_score,
                "created_at": item.created_at.isoformat() if item.created_at else "",
                "result_data": item.result_data
            })
        return Response(content=json.dumps(data, indent=2), media_type="application/json", headers={
            "Content-Disposition": "attachment; filename=investigations_export.json"
        })
    else:
        raise HTTPException(status_code=400, detail="Unsupported format. Use 'csv' or 'json'.")


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


# ── PATCH — Update metadata ──────────────────────────────────────────── #

@router.patch("/{investigation_id}", response_model=InvestigationResponse)
def update_investigation(
    investigation_id: str,
    update_data: InvestigationUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    inv = investigation_repository.update(
        db, investigation_id, current_user.id, update_data.model_dump(exclude_unset=True)
    )
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


# ── POST — Bulk action ───────────────────────────────────────────────── #

@router.post("/bulk-action", status_code=status.HTTP_200_OK)
def bulk_action_investigations(
    request: BulkActionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if request.action == "delete":
        count = investigation_repository.bulk_soft_delete(db, request.ids, current_user.id)
        return {"status": "success", "deleted_count": count}
    elif request.action == "update_folder":
        count = investigation_repository.bulk_update(db, request.ids, current_user.id, {"folder_id": request.folder_id})
        return {"status": "success", "updated_count": count}
    elif request.action == "update_status":
        count = investigation_repository.bulk_update(db, request.ids, current_user.id, {"workflow_status": request.workflow_status})
        return {"status": "success", "updated_count": count}
    elif request.action == "archive":
        count = investigation_repository.bulk_update(db, request.ids, current_user.id, {"is_archived": True})
        return {"status": "success", "updated_count": count}
    elif request.action == "unarchive":
        count = investigation_repository.bulk_update(db, request.ids, current_user.id, {"is_archived": False})
        return {"status": "success", "updated_count": count}
    else:
        raise HTTPException(status_code=400, detail=f"Unknown action {request.action}")
