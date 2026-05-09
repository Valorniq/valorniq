"""
App organisation service.
FIXED: SQLAlchemy JSON column mutation — all writes now reassign the column
and call flag_modified() so SQLAlchemy's change-tracking detects the update.
"""
import uuid
from copy import deepcopy
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import flag_modified

from app.models.app_organization import AppOrganization
from app.schemas.app_organization import (
    CreateAppFolder,
    RenameAppFolder,
    MoveModuleRequest,
    ReorderModulesRequest,
    AppOrganizationUpdate,
)


class AppOrganizationService:
    """Service for managing custom app organisation and sidebar structure."""

    # ── Internal helpers ───────────────────────────────────────────────────────

    @staticmethod
    def _get_or_create(db: Session, user_id: str) -> AppOrganization:
        """Return the user's AppOrganization, creating a default one if absent."""
        org = db.query(AppOrganization).filter(AppOrganization.user_id == user_id).first()
        if not org:
            org = AppOrganization(
                id=str(uuid.uuid4()),
                user_id=user_id,
                folders={},
                module_order={},
                pinned_modules=[],
                hidden_categories=[],
                category_names={},
                default_view="expanded",
                enabled_modules=[],
            )
            db.add(org)
            db.commit()
            db.refresh(org)
        return org

    @staticmethod
    def _save(db: Session, org: AppOrganization) -> AppOrganization:
        """
        Persist changes to all JSON columns.
        flag_modified is required because SQLAlchemy does not automatically
        detect in-place mutations on JSON/ARRAY columns.
        """
        for col in ("folders", "module_order", "pinned_modules",
                    "hidden_categories", "category_names", "enabled_modules"):
            flag_modified(org, col)
        db.commit()
        db.refresh(org)
        return org

    # ── Public API ─────────────────────────────────────────────────────────────

    @classmethod
    def get_organization(cls, db: Session, user_id: str) -> AppOrganization:
        return cls._get_or_create(db, user_id)

    @classmethod
    def create_folder(cls, db: Session, user_id: str, folder_data: CreateAppFolder) -> AppOrganization:
        org = cls._get_or_create(db, user_id)
        folder_id = str(uuid.uuid4())
        # Immutable reassignment — creates a new dict so SQLAlchemy detects the change
        new_folders = deepcopy(org.folders) if org.folders else {}
        new_folders[folder_id] = {
            "id": folder_id,
            "name": folder_data.name,
            "icon": folder_data.icon or "folder",
            "children": [],
            "order": len(new_folders),
        }
        org.folders = new_folders
        return cls._save(db, org)

    @classmethod
    def rename_folder(cls, db: Session, user_id: str, folder_id: str, rename_data: RenameAppFolder) -> AppOrganization:
        org = cls._get_or_create(db, user_id)
        folders = deepcopy(org.folders) if org.folders else {}
        if folder_id not in folders:
            raise ValueError(f"Folder '{folder_id}' not found")
        folders[folder_id]["name"] = rename_data.new_name
        org.folders = folders
        return cls._save(db, org)

    @classmethod
    def delete_folder(cls, db: Session, user_id: str, folder_id: str) -> AppOrganization:
        org = cls._get_or_create(db, user_id)
        folders = deepcopy(org.folders) if org.folders else {}
        if folder_id not in folders:
            raise ValueError(f"Folder '{folder_id}' not found")
        # Children return to root — store their IDs for future root-level ordering if needed
        del folders[folder_id]
        org.folders = folders
        return cls._save(db, org)

    @classmethod
    def move_module(cls, db: Session, user_id: str, move_request: MoveModuleRequest) -> AppOrganization:
        org = cls._get_or_create(db, user_id)
        folders = deepcopy(org.folders) if org.folders else {}
        module_id = move_request.module_id
        target_folder_id = move_request.target_folder_id

        # Remove from every folder first
        for fid, folder in folders.items():
            children = folder.get("children", [])
            if module_id in children:
                folder["children"] = [c for c in children if c != module_id]

        # Place into target folder (or root)
        if target_folder_id and target_folder_id in folders:
            folders[target_folder_id]["children"].append(module_id)

        org.folders = folders
        return cls._save(db, org)

    @classmethod
    def reorder_modules(cls, db: Session, user_id: str, reorder_request: ReorderModulesRequest) -> AppOrganization:
        org = cls._get_or_create(db, user_id)
        folder_id = reorder_request.folder_id
        new_order = reorder_request.module_ids

        if folder_id:
            folders = deepcopy(org.folders) if org.folders else {}
            if folder_id in folders:
                folders[folder_id]["children"] = new_order
            org.folders = folders
        else:
            # Reorder top-level enabled modules
            current = list(org.enabled_modules or [])
            reordered = [m for m in new_order if m in current]
            # Append any modules not in the new order list to the end
            reordered += [m for m in current if m not in new_order]
            org.enabled_modules = reordered

        return cls._save(db, org)

    @classmethod
    def toggle_category_visibility(cls, db: Session, user_id: str, category: str) -> AppOrganization:
        org = cls._get_or_create(db, user_id)
        hidden = list(org.hidden_categories or [])
        if category in hidden:
            hidden.remove(category)
        else:
            hidden.append(category)
        org.hidden_categories = hidden
        return cls._save(db, org)

    @classmethod
    def pin_module(cls, db: Session, user_id: str, module_id: str) -> AppOrganization:
        org = cls._get_or_create(db, user_id)
        pinned = list(org.pinned_modules or [])
        if module_id not in pinned:
            pinned.append(module_id)
            org.pinned_modules = pinned
            return cls._save(db, org)
        return org

    @classmethod
    def unpin_module(cls, db: Session, user_id: str, module_id: str) -> AppOrganization:
        org = cls._get_or_create(db, user_id)
        pinned = list(org.pinned_modules or [])
        if module_id in pinned:
            pinned.remove(module_id)
            org.pinned_modules = pinned
            return cls._save(db, org)
        return org

    @classmethod
    def update_organization(cls, db: Session, user_id: str, update_data: AppOrganizationUpdate) -> AppOrganization:
        org = cls._get_or_create(db, user_id)
        if update_data.folders           is not None: org.folders           = update_data.folders
        if update_data.module_order      is not None: org.module_order      = update_data.module_order
        if update_data.pinned_modules    is not None: org.pinned_modules    = list(update_data.pinned_modules)
        if update_data.hidden_categories is not None: org.hidden_categories = list(update_data.hidden_categories)
        if update_data.category_names    is not None: org.category_names    = update_data.category_names
        if update_data.default_view      is not None: org.default_view      = update_data.default_view
        if update_data.enabled_modules   is not None: org.enabled_modules   = list(update_data.enabled_modules)
        return cls._save(db, org)