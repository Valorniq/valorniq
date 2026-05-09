"""
App organization model - allows users to create custom folders,
reorganize modules, reorder apps, and customize sidebar structure.
"""
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, JSON, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class AppOrganization(Base):
    """
    Stores the custom app organization for each user.
    Includes folder structure, module organization, and reordering preferences.
    """
    __tablename__ = "app_organizations"
    
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"))
    user = relationship("User", back_populates="app_organization")
    
    # Folder structure: {
    #   "id": "folder_id",
    #   "name": "Custom Folder",
    #   "icon": "folder",
    #   "children": ["module_id", "module_id"],
    #   "order": 1
    # }
    folders = Column(JSON, default={})
    
    # Module ordering within default categories
    # {
    #   "crm": ["crm", "sales"],
    #   "inventory": ["inventory", "manufacturing"]
    # }
    module_order = Column(JSON, default={})
    
    # Pinned modules (appear at top of sidebar)
    pinned_modules = Column(JSON, default=[])
    
    # Hidden modules (collapsed but not removed)
    hidden_categories = Column(JSON, default=[])
    
    # Custom category names
    # {"sales": "Sales & CRM", "inventory": "Supply Chain"}
    category_names = Column(JSON, default={})
    
    # Default sidebar view: 'compact' or 'expanded'
    default_view = Column(String, default="expanded")
    
    # Enabled modules for current plan
    enabled_modules = Column(JSON, default=[])
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
