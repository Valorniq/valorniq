"""
App organization router - custom folder management, reordering, and sidebar customization.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.app_organization import (
    AppOrganizationResponse, AppOrganizationUpdate,
    CreateAppFolder, RenameAppFolder, MoveModuleRequest, ReorderModulesRequest
)
from app.services.app_organization_service import AppOrganizationService

router = APIRouter(prefix="/api/v1/organization", tags=["app-organization"])

@router.get("/", response_model=AppOrganizationResponse)
def get_organization(user_id: str = Query(...), db: Session = Depends(get_db)):
    """Get app organization for a user."""
    org = AppOrganizationService.get_organization(db, user_id)
    return org

@router.put("/", response_model=AppOrganizationResponse)
def update_organization(user_id: str = Query(...), update_data: AppOrganizationUpdate = ..., db: Session = Depends(get_db)):
    """Update entire app organization."""
    org = AppOrganizationService.update_organization(db, user_id, update_data)
    return org

# ==================== FOLDER OPERATIONS ====================
@router.post("/folders", response_model=AppOrganizationResponse)
def create_folder(user_id: str = Query(...), folder_data: CreateAppFolder = ..., db: Session = Depends(get_db)):
    """Create a new custom folder."""
    org = AppOrganizationService.create_folder(db, user_id, folder_data)
    return org

@router.put("/folders/{folder_id}/rename", response_model=AppOrganizationResponse)
def rename_folder(folder_id: str, user_id: str = Query(...), rename_data: RenameAppFolder = ..., db: Session = Depends(get_db)):
    """Rename a folder."""
    org = AppOrganizationService.rename_folder(db, user_id, folder_id, rename_data)
    return org

@router.delete("/folders/{folder_id}", response_model=AppOrganizationResponse)
def delete_folder(folder_id: str, user_id: str = Query(...), db: Session = Depends(get_db)):
    """Delete a folder (moves children to root)."""
    org = AppOrganizationService.delete_folder(db, user_id, folder_id)
    return org

# ==================== MODULE OPERATIONS ====================
@router.post("/modules/move", response_model=AppOrganizationResponse)
def move_module(user_id: str = Query(...), move_request: MoveModuleRequest = ..., db: Session = Depends(get_db)):
    """Move a module to a folder or root level."""
    org = AppOrganizationService.move_module(db, user_id, move_request)
    return org

@router.post("/modules/reorder", response_model=AppOrganizationResponse)
def reorder_modules(user_id: str = Query(...), reorder_request: ReorderModulesRequest = ..., db: Session = Depends(get_db)):
    """Reorder modules within a folder or category."""
    org = AppOrganizationService.reorder_modules(db, user_id, reorder_request)
    return org

@router.post("/modules/{module_id}/pin", response_model=AppOrganizationResponse)
def pin_module(module_id: str, user_id: str = Query(...), db: Session = Depends(get_db)):
    """Pin a module to the top of sidebar."""
    org = AppOrganizationService.pin_module(db, user_id, module_id)
    return org

@router.post("/modules/{module_id}/unpin", response_model=AppOrganizationResponse)
def unpin_module(module_id: str, user_id: str = Query(...), db: Session = Depends(get_db)):
    """Unpin a module from top."""
    org = AppOrganizationService.unpin_module(db, user_id, module_id)
    return org

# ==================== CATEGORY OPERATIONS ====================
@router.post("/categories/{category}/toggle", response_model=AppOrganizationResponse)
def toggle_category(category: str, user_id: str = Query(...), db: Session = Depends(get_db)):
    """Toggle visibility of a category."""
    org = AppOrganizationService.toggle_category_visibility(db, user_id, category)
    return org
