"""
User model for authentication and profile management.
"""
from sqlalchemy import Column, String, DateTime, Boolean, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.core.database import Base

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    USER = "user"
    ENTERPRISE = "enterprise"

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    display_name = Column(String, nullable=True)
    password_hash = Column(String, nullable=True)  # Nullable for OAuth users
    
    # Profile info
    phone = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    
    # OAuth providers
    google_id = Column(String, nullable=True, unique=True)
    github_id = Column(String, nullable=True, unique=True)
    microsoft_id = Column(String, nullable=True, unique=True)
    apple_id = Column(String, nullable=True, unique=True)
    
    # Plan and permissions
    current_plan = Column(String, default="free")
    role = Column(Enum(UserRole), default=UserRole.USER)
    
    # Status
    is_active = Column(Boolean, default=True)
    email_verified = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)
    
    # Relationships
    app_organization = relationship("AppOrganization", back_populates="user", cascade="all, delete-orphan")
    leads = relationship("Lead", back_populates="owner")
    products = relationship("Product", back_populates="owner")
    sales_orders = relationship("SalesOrder", back_populates="owner")
    customers = relationship("Customer", back_populates="owner")
