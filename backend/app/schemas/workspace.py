from pydantic import BaseModel, ConfigDict
from typing import Optional, Any, Dict
from datetime import datetime

class WorkspaceFolderBase(BaseModel):
    name: str

class WorkspaceFolderCreate(WorkspaceFolderBase):
    pass

class WorkspaceFolderUpdate(BaseModel):
    name: Optional[str] = None

class WorkspaceFolderResponse(WorkspaceFolderBase):
    id: str
    user_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class SavedSearchBase(BaseModel):
    name: str
    query_string: Optional[str] = None
    filters: Optional[Dict[str, Any]] = None

class SavedSearchCreate(SavedSearchBase):
    pass

class SavedSearchUpdate(BaseModel):
    name: Optional[str] = None
    query_string: Optional[str] = None
    filters: Optional[Dict[str, Any]] = None

class SavedSearchResponse(SavedSearchBase):
    id: str
    user_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
