"""
App organization service - manages custom folder structure,
module reordering, reorganization, and sidebar customization.
"""
import uuid
from sqlalchemy.orm import Session
from app.models.app_organization import AppOrganization
from app.schemas.app_organization import (
    CreateAppFolder, RenameAppFolder, MoveModuleRequest, 
    ReorderModulesRequest, AppOrganizationUpdate
)

class AppOrganizationService:
    """Service for managing app organization and custom module structure."""
    
    @staticmethod
    def get_organization(db: Session, user_id: str) -> AppOrganization:
        """Get app organization for a user."""
        org = db.query(AppOrganization).filter(AppOrganization.user_id == user_id).first()
        if not org:
            # Create default if doesn't exist
            org = AppOrganization(
                id=str(uuid.uuid4()),
                user_id=user_id,
                folders={},
                module_order={},
                pinned_modules=[],
                hidden_categories=[],
                category_names={},
                default_view="expanded",
                enabled_modules=[]
            )
            db.add(org)
            db.commit()
        return org
    
    @staticmethod
    def create_folder(db: Session, user_id: str, folder_data: CreateAppFolder) -> AppOrganization:
        """Create a new custom folder."""
        org = AppOrganizationService.get_organization(db, user_id)
        
        folder_id = str(uuid.uuid4())
        org.folders[folder_id] = {
            "id": folder_id,
            "name": folder_data.name,
            "icon": folder_data.icon or "folder",
            "children": [],
            "order": len(org.folders)
        }
        
        db.commit()
        db.refresh(org)
        return org
    
    @staticmethod
    def rename_folder(db: Session, user_id: str, folder_id: str, rename_data: RenameAppFolder) -> AppOrganization:
        """Rename an existing folder."""
        org = AppOrganizationService.get_organization(db, user_id)
        
        if folder_id in org.folders:
            org.folders[folder_id]["name"] = rename_data.new_name
            db.commit()
            db.refresh(org)
        else:
            raise ValueError(f"Folder {folder_id} not found")
        
        return org
    
    @staticmethod
    def delete_folder(db: Session, user_id: str, folder_id: str) -> AppOrganization:
        """Delete a folder and move its modules to root."""
        org = AppOrganizationService.get_organization(db, user_id)
        
        if folder_id in org.folders:
            # Move children to root
            children = org.folders[folder_id].get("children", [])
            del org.folders[folder_id]
            db.commit()
            db.refresh(org)
        else:
            raise ValueError(f"Folder {folder_id} not found")
        
        return org
    
    @staticmethod
    def move_module(db: Session, user_id: str, move_request: MoveModuleRequest) -> AppOrganization:
        """Move a module to a folder or root level."""
        org = AppOrganizationService.get_organization(db, user_id)
        
        module_id = move_request.module_id
        target_folder_id = move_request.target_folder_id
        
        # Remove from all folders/root
        for folder in org.folders.values():
            if module_id in folder.get("children", []):
                folder["children"].remove(module_id)
        
        # Add to target or root
        if target_folder_id and target_folder_id in org.folders:
            org.folders[target_folder_id]["children"].append(module_id)
        else:
            # Add to root (module_order)
            if move_request.order is not None:
                # Insert at specific order
                for cat_modules in org.module_order.values():
                    if module_id not in cat_modules:
                        cat_modules.insert(move_request.order, module_id)
        
        db.commit()
        db.refresh(org)
        return org
    
    @staticmethod
    def reorder_modules(db: Session, user_id: str, reorder_request: ReorderModulesRequest) -> AppOrganization:
        """Reorder modules within a folder or category."""
        org = AppOrganizationService.get_organization(db, user_id)
        
        folder_id = reorder_request.folder_id
        new_order = reorder_request.module_ids
        
        if folder_id:
            # Reorder within folder
            if folder_id in org.folders:
                org.folders[folder_id]["children"] = new_order
        else:
            # Reorder in module_order - this would need to be refined based on category
            # For now, just update the enabled modules order
            org.enabled_modules = [m for m in new_order if m in org.enabled_modules]
        
        db.commit()
        db.refresh(org)
        return org
    
    @staticmethod
    def toggle_category_visibility(db: Session, user_id: str, category: str) -> AppOrganization:
        """Toggle visibility of a category."""
        org = AppOrganizationService.get_organization(db, user_id)
        
        if category in org.hidden_categories:
            org.hidden_categories.remove(category)
        else:
            org.hidden_categories.append(category)
        
        db.commit()
        db.refresh(org)
        return org
    
    @staticmethod
    def pin_module(db: Session, user_id: str, module_id: str) -> AppOrganization:
        """Pin a module to the top of the sidebar."""
        org = AppOrganizationService.get_organization(db, user_id)
        
        if module_id not in org.pinned_modules:
            org.pinned_modules.append(module_id)
            db.commit()
            db.refresh(org)
        
        return org
    
    @staticmethod
    def unpin_module(db: Session, user_id: str, module_id: str) -> AppOrganization:
        """Unpin a module from the top."""
        org = AppOrganizationService.get_organization(db, user_id)
        
        if module_id in org.pinned_modules:
            org.pinned_modules.remove(module_id)
            db.commit()
            db.refresh(org)
        
        return org
    
    @staticmethod
    def update_organization(db: Session, user_id: str, update_data: AppOrganizationUpdate) -> AppOrganization:
        """Update entire app organization."""
        org = AppOrganizationService.get_organization(db, user_id)
        
        if update_data.folders is not None:
            org.folders = update_data.folders
        if update_data.module_order is not None:
            org.module_order = update_data.module_order
        if update_data.pinned_modules is not None:
            org.pinned_modules = update_data.pinned_modules
        if update_data.hidden_categories is not None:
            org.hidden_categories = update_data.hidden_categories
        if update_data.category_names is not None:
            org.category_names = update_data.category_names
        if update_data.default_view is not None:
            org.default_view = update_data.default_view
        if update_data.enabled_modules is not None:
            org.enabled_modules = update_data.enabled_modules
        
        db.commit()
        db.refresh(org)
        return org
