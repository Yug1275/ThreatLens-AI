from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any
from app.services.backup_service import backup_service
from app.api.deps import get_current_active_superuser

router = APIRouter()

@router.post("/create", response_model=Dict[str, str])
def create_backup(current_user = Depends(get_current_active_superuser)):
    """
    Trigger a manual backup. Requires superuser privileges.
    """
    try:
        filename = backup_service.create_backup(is_automated=False)
        return {"status": "success", "filename": filename, "message": "Backup created successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/list", response_model=List[Dict[str, Any]])
def list_backups(current_user = Depends(get_current_active_superuser)):
    """
    List all available backups. Requires superuser privileges.
    """
    try:
        return backup_service.list_backups()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/restore/{filename}", response_model=Dict[str, str])
def restore_backup(filename: str, current_user = Depends(get_current_active_superuser)):
    """
    Restore a database from a backup file. Requires superuser privileges.
    """
    try:
        success = backup_service.restore_backup(filename)
        if success:
            return {"status": "success", "message": f"Database restored from {filename}"}
        return {"status": "error", "message": "Restore failed for unknown reasons."}
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/verify/{filename}", response_model=Dict[str, Any])
def verify_backup(filename: str, current_user = Depends(get_current_active_superuser)):
    """
    Verify the integrity of a backup file.
    """
    try:
        return backup_service.verify_backup(filename)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/test-recovery/{filename}", response_model=Dict[str, Any])
def test_recovery(filename: str, current_user = Depends(get_current_active_superuser)):
    """
    Test recovery for a given backup.
    """
    try:
        return backup_service.test_recovery(filename)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
