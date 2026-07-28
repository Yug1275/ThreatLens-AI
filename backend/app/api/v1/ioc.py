from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from urllib.parse import unquote

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.repositories.investigation_repository import investigation_repository
from app.schemas.investigation import IOCListResponse, IOCDetail

router = APIRouter()

@router.get("/", response_model=IOCListResponse)
def get_iocs(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    type: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: Optional[str] = "last_seen",
    sort_order: Optional[str] = "desc",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    skip = (page - 1) * limit
    items, total = investigation_repository.get_iocs(
        db,
        user_id=current_user.id,
        skip=skip,
        limit=limit,
        ioc_type=type,
        search=search,
        sort_by=sort_by,
        sort_order=sort_order
    )
    
    pages = (total + limit - 1) // limit if total > 0 else 1
    
    return {
        "items": items,
        "total": total,
        "page": page,
        "pages": pages,
        "limit": limit
    }

@router.get("/{target:path}", response_model=IOCDetail)
def get_ioc_details(
    target: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    target_decoded = unquote(target)
    detail = investigation_repository.get_ioc_details(db, user_id=current_user.id, target=target_decoded)
    if not detail:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="IOC not found")
    return detail
