"""
AI API Routes — Phase 9 AI Intelligence Engine
Provides endpoints for AI enrichment, IOC correlation, executive reports, and status.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.repositories.investigation_repository import investigation_repository
from app.services.ai.ai_service import ai_service

router = APIRouter()


# ── Request Schemas ───────────────────────────────────────────────────── #

class EnrichRequest(BaseModel):
    """Optional: force re-enrichment even if cached."""
    force: bool = False


class CorrelateRequest(BaseModel):
    """IOC correlation request with investigation IDs."""
    investigation_ids: List[str]


class ExecutiveReportRequest(BaseModel):
    """Executive report request with investigation IDs."""
    investigation_ids: List[str]


# ── POST — Re-enrich an existing investigation ───────────────────────── #

@router.post("/enrich/{investigation_id}")
def enrich_investigation(
    investigation_id: str,
    request_body: EnrichRequest = EnrichRequest(),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Re-run AI enrichment on an existing investigation."""
    inv = investigation_repository.get_by_id(db, investigation_id, current_user.id)
    if not inv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Investigation not found")

    if not inv.result_data:
        raise HTTPException(status_code=400, detail="Investigation has no result data to enrich")

    # Clear cache if forced
    if request_body.force:
        from app.services.ai.ai_cache import ai_cache
        ai_cache.clear()

    # Run AI enrichment
    ai_analysis = ai_service.enrich_investigation(
        inv_type=inv.type,
        target=inv.target,
        result_data=inv.result_data,
    )

    if ai_analysis is None:
        raise HTTPException(status_code=503, detail="AI service is currently unavailable")

    # Merge into result_data
    updated_result = dict(inv.result_data)
    updated_result["ai_analysis"] = ai_analysis
    investigation_repository.update(
        db, investigation_id, current_user.id, {"result_data": updated_result}
    )

    return {
        "status": "success",
        "investigation_id": investigation_id,
        "ai_analysis": ai_analysis,
    }


# ── POST — Correlate IOCs ────────────────────────────────────────────── #

@router.post("/correlate")
def correlate_iocs(
    request_body: CorrelateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Cross-correlate IOCs from multiple investigations."""
    if len(request_body.investigation_ids) < 2:
        raise HTTPException(status_code=400, detail="At least 2 investigation IDs are required")

    investigations = []
    for inv_id in request_body.investigation_ids[:20]:  # Cap at 20
        inv = investigation_repository.get_by_id(db, inv_id, current_user.id)
        if inv:
            investigations.append({
                "id": inv.id,
                "type": inv.type,
                "target": inv.target,
                "threat_score": inv.threat_score,
                "result_data": inv.result_data,
                "created_at": str(inv.created_at),
            })

    if len(investigations) < 2:
        raise HTTPException(status_code=404, detail="Could not find enough investigations to correlate")

    correlation = ai_service.correlate_iocs(investigations)

    return {
        "status": "success",
        "investigation_count": len(investigations),
        "correlation": correlation,
    }


# ── POST — Generate Executive Report ─────────────────────────────────── #

@router.post("/executive-report")
def generate_executive_report(
    request_body: ExecutiveReportRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Generate an executive threat intelligence report."""
    investigations = []
    for inv_id in request_body.investigation_ids[:20]:
        inv = investigation_repository.get_by_id(db, inv_id, current_user.id)
        if inv:
            investigations.append({
                "id": inv.id,
                "type": inv.type,
                "target": inv.target,
                "status": inv.status,
                "threat_score": inv.threat_score,
                "result_data": inv.result_data,
                "created_at": str(inv.created_at),
            })

    if not investigations:
        raise HTTPException(status_code=404, detail="No investigations found")

    report = ai_service.generate_executive_report(investigations)

    return {
        "status": "success",
        "report": report,
    }


# ── GET — AI Service Status ──────────────────────────────────────────── #

@router.get("/status")
def get_ai_status(
    current_user: User = Depends(get_current_user),
):
    """Check AI service health and configuration status."""
    return ai_service.get_status()
