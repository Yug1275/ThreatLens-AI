from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.api.v1.auth import get_current_user
from app.models.user import User
from app.schemas.workspace import (
    WorkspaceFolderCreate,
    WorkspaceFolderUpdate,
    WorkspaceFolderResponse,
    SavedSearchCreate,
    SavedSearchUpdate,
    SavedSearchResponse
)
from app.services.workspace_service import WorkspaceService
from app.services.security_service import log_audit
from fastapi import Request

router = APIRouter()

# --- Folders ---

@router.get("/folders", response_model=List[WorkspaceFolderResponse])
def get_folders(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return WorkspaceService.get_folders(db, current_user.id)

@router.post("/folders", response_model=WorkspaceFolderResponse)
def create_folder(folder: WorkspaceFolderCreate, request: Request, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    res = WorkspaceService.create_folder(db, current_user.id, folder)
    log_audit(db, current_user.id, "CREATE_FOLDER", "WORKSPACE_FOLDER", res.id, {"name": folder.name}, request)
    return res

@router.put("/folders/{folder_id}", response_model=WorkspaceFolderResponse)
def update_folder(folder_id: str, folder_in: WorkspaceFolderUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return WorkspaceService.update_folder(db, current_user.id, folder_id, folder_in)

@router.delete("/folders/{folder_id}")
def delete_folder(folder_id: str, request: Request, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    WorkspaceService.delete_folder(db, current_user.id, folder_id)
    log_audit(db, current_user.id, "DELETE_FOLDER", "WORKSPACE_FOLDER", folder_id, None, request)
    return {"status": "success"}

# --- Saved Searches ---

@router.get("/searches", response_model=List[SavedSearchResponse])
def get_saved_searches(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return WorkspaceService.get_saved_searches(db, current_user.id)

@router.post("/searches", response_model=SavedSearchResponse)
def create_saved_search(search: SavedSearchCreate, request: Request, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    res = WorkspaceService.create_saved_search(db, current_user.id, search)
    log_audit(db, current_user.id, "CREATE_SAVED_SEARCH", "SAVED_SEARCH", res.id, {"name": search.name}, request)
    return res

@router.put("/searches/{search_id}", response_model=SavedSearchResponse)
def update_saved_search(search_id: str, search_in: SavedSearchUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return WorkspaceService.update_saved_search(db, current_user.id, search_id, search_in)

@router.delete("/searches/{search_id}")
def delete_saved_search(search_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    WorkspaceService.delete_saved_search(db, current_user.id, search_id)
    return {"status": "success"}
