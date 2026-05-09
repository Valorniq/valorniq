"""
App organization schemas for custom folder and module management.
"""
from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import datetime

class AppFolder(BaseModel):
    """Schema for an app folder."""
    id: str
    name: str
    icon: Optional[str] = "folder"
    children: List[str]  # Module IDs
    order: int

class CreateAppFolder(BaseModel):
    """Schema for creating a new folder."""
    name: str
    icon: Optional[str] = "folder"

class RenameAppFolder(BaseModel):
    """Schema for renaming a folder."""
    new_name: str

class MoveModuleRequest(BaseModel):
    """Schema for moving a module to a folder."""
    module_id: str
    target_folder_id: Optional[str] = None  # None means root level
    order: Optional[int] = None

class ReorderModulesRequest(BaseModel):
    """Schema for reordering modules."""
    folder_id: Optional[str] = None
    module_ids: List[str]  # New order

class AppOrganizationResponse(BaseModel):
    """Schema for app organization response."""
    id: str
    user_id: str
    folders: Dict
    module_order: Dict
    pinned_modules: List[str]
    hidden_categories: List[str]
    category_names: Dict[str, str]
    default_view: str
    enabled_modules: List[str]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class AppOrganizationUpdate(BaseModel):
    """Schema for updating app organization."""
    folders: Optional[Dict] = None
    module_order: Optional[Dict] = None
    pinned_modules: Optional[List[str]] = None
    hidden_categories: Optional[List[str]] = None
    category_names: Optional[Dict[str, str]] = None
    default_view: Optional[str] = None
    enabled_modules: Optional[List[str]] = None
