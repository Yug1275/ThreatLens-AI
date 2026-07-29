from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.workspace import WorkspaceFolder, SavedSearch
from app.schemas.workspace import (
    WorkspaceFolderCreate,
    WorkspaceFolderUpdate,
    SavedSearchCreate,
    SavedSearchUpdate
)

class WorkspaceService:
    @staticmethod
    def get_folders(db: Session, user_id: int):
        return db.query(WorkspaceFolder).filter(WorkspaceFolder.user_id == user_id).order_by(WorkspaceFolder.created_at.desc()).all()

    @staticmethod
    def create_folder(db: Session, user_id: int, folder: WorkspaceFolderCreate):
        new_folder = WorkspaceFolder(user_id=user_id, name=folder.name)
        db.add(new_folder)
        db.commit()
        db.refresh(new_folder)
        return new_folder

    @staticmethod
    def update_folder(db: Session, user_id: int, folder_id: str, folder_in: WorkspaceFolderUpdate):
        folder = db.query(WorkspaceFolder).filter(
            WorkspaceFolder.id == folder_id, WorkspaceFolder.user_id == user_id
        ).first()
        if not folder:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Folder not found")
        
        if folder_in.name is not None:
            folder.name = folder_in.name
            
        db.commit()
        db.refresh(folder)
        return folder

    @staticmethod
    def delete_folder(db: Session, user_id: int, folder_id: str):
        folder = db.query(WorkspaceFolder).filter(
            WorkspaceFolder.id == folder_id, WorkspaceFolder.user_id == user_id
        ).first()
        if not folder:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Folder not found")
        
        db.delete(folder)
        db.commit()
        return True

    @staticmethod
    def get_saved_searches(db: Session, user_id: int):
        return db.query(SavedSearch).filter(SavedSearch.user_id == user_id).order_by(SavedSearch.created_at.desc()).all()

    @staticmethod
    def create_saved_search(db: Session, user_id: int, search: SavedSearchCreate):
        new_search = SavedSearch(
            user_id=user_id,
            name=search.name,
            query_string=search.query_string,
            filters=search.filters
        )
        db.add(new_search)
        db.commit()
        db.refresh(new_search)
        return new_search

    @staticmethod
    def update_saved_search(db: Session, user_id: int, search_id: str, search_in: SavedSearchUpdate):
        search = db.query(SavedSearch).filter(
            SavedSearch.id == search_id, SavedSearch.user_id == user_id
        ).first()
        if not search:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Saved search not found")
            
        if search_in.name is not None:
            search.name = search_in.name
        if search_in.query_string is not None:
            search.query_string = search_in.query_string
        if search_in.filters is not None:
            search.filters = search_in.filters
            
        db.commit()
        db.refresh(search)
        return search

    @staticmethod
    def delete_saved_search(db: Session, user_id: int, search_id: str):
        search = db.query(SavedSearch).filter(
            SavedSearch.id == search_id, SavedSearch.user_id == user_id
        ).first()
        if not search:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Saved search not found")
            
        db.delete(search)
        db.commit()
        return True
