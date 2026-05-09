"""
Business schemas for CRM, Sales, Inventory, and ERP modules.
"""
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class LeadCreate(BaseModel):
    """Schema for creating a new lead."""
    name: str
    email: Optional[str] = None
    source: Optional[str] = "Website"
    estimated_value: Optional[float] = 0.0

class LeadUpdate(BaseModel):
    """Schema for updating a lead."""
    name: Optional[str] = None
    email: Optional[str] = None
    source: Optional[str] = None
    status: Optional[str] = None
    estimated_value: Optional[float] = None

class LeadResponse(BaseModel):
    """Schema for lead response."""
    id: str
    name: str
    email: Optional[str]
    source: Optional[str]
    status: str
    estimated_value: float
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class ProductCreate(BaseModel):
    """Schema for creating a product."""
    name: str
    sku: str
    price: float
    stock: int
    category: Optional[str] = "General"

class ProductUpdate(BaseModel):
    """Schema for updating a product."""
    name: Optional[str] = None
    price: Optional[float] = None
    stock: Optional[int] = None
    category: Optional[str] = None

class ProductResponse(BaseModel):
    """Schema for product response."""
    id: str
    name: str
    sku: str
    price: float
    stock: int
    category: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class CustomerCreate(BaseModel):
    """Schema for creating a customer."""
    name: str
    email: str
    phone: Optional[str] = None
    address: Optional[str] = None

class CustomerResponse(BaseModel):
    """Schema for customer response."""
    id: str
    name: str
    email: str
    phone: Optional[str]
    status: str
    address: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

class OrderItemCreate(BaseModel):
    """Schema for order items."""
    product_id: str
    quantity: int
    price: float

class SalesOrderCreate(BaseModel):
    """Schema for creating a sales order."""
    customer_id: str
    items: List[OrderItemCreate]
    total_value: float

class SalesOrderResponse(BaseModel):
    """Schema for sales order response."""
    id: str
    customer_id: str
    items: List[dict]
    total_value: float
    status: str
    order_date: datetime
    created_at: datetime
    
    class Config:
        from_attributes = True
