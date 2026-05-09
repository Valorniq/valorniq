"""
Business models for CRM, Sales, Inventory, and ERP modules.
"""
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Enum, JSON, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.core.database import Base

# Status enums
class LeadStatus(str, enum.Enum):
    NEW = "new"
    CONTACTED = "contacted"
    QUALIFIED = "qualified"
    LOST = "lost"

class CustomerStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"

class OrderStatus(str, enum.Enum):
    DRAFT = "draft"
    CONFIRMED = "confirmed"
    SHIPPED = "shipped"
    CANCELLED = "cancelled"

class ActivityType(str, enum.Enum):
    NOTE = "note"
    CALL = "call"
    EMAIL = "email"
    MEETING = "meeting"

# Models
class Lead(Base):
    __tablename__ = "leads"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, nullable=True)
    source = Column(String, nullable=True)
    status = Column(Enum(LeadStatus), default=LeadStatus.NEW)
    estimated_value = Column(Float, default=0.0)
    
    owner_id = Column(String, ForeignKey("users.id"))
    owner = relationship("User", back_populates="leads")
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Customer(Base):
    __tablename__ = "customers"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String)
    phone = Column(String, nullable=True)
    status = Column(Enum(CustomerStatus), default=CustomerStatus.ACTIVE)
    address = Column(String, nullable=True)
    
    owner_id = Column(String, ForeignKey("users.id"))
    owner = relationship("User", back_populates="customers")
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Product(Base):
    __tablename__ = "products"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    sku = Column(String, unique=True, index=True)
    price = Column(Float)
    stock = Column(Integer, default=0)
    category = Column(String, nullable=True)
    
    owner_id = Column(String, ForeignKey("users.id"))
    owner = relationship("User", back_populates="products")
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class SalesOrder(Base):
    __tablename__ = "sales_orders"
    
    id = Column(String, primary_key=True, index=True)
    customer_id = Column(String)
    items = Column(JSON)  # List of {productId, quantity, price}
    total_value = Column(Float)
    status = Column(Enum(OrderStatus), default=OrderStatus.DRAFT)
    order_date = Column(DateTime, default=datetime.utcnow)
    
    owner_id = Column(String, ForeignKey("users.id"))
    owner = relationship("User", back_populates="sales_orders")
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Activity(Base):
    __tablename__ = "activities"
    
    id = Column(String, primary_key=True, index=True)
    related_id = Column(String)  # Lead or Customer ID
    related_type = Column(String)  # 'lead' or 'customer'
    activity_type = Column(Enum(ActivityType))
    content = Column(Text)
    
    owner_id = Column(String, ForeignKey("users.id"))
    
    created_at = Column(DateTime, default=datetime.utcnow)
