"""
Business modules router - CRM, Inventory, Sales, Customers, and Activities.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
import uuid
from datetime import datetime

from app.core.database import get_db
from app.models.business import Lead, Product, SalesOrder, Customer
from app.schemas.business import (
    LeadCreate, LeadUpdate, LeadResponse,
    ProductCreate, ProductUpdate, ProductResponse,
    SalesOrderCreate, SalesOrderResponse,
    CustomerCreate, CustomerResponse
)

router = APIRouter(prefix="/api/v1", tags=["business"])

# ==================== LEADS ====================
@router.get("/leads", response_model=list[LeadResponse])
def list_leads(user_id: str = Query(...), db: Session = Depends(get_db)):
    """List all leads for a user."""
    leads = db.query(Lead).filter(Lead.owner_id == user_id).all()
    return leads

@router.post("/leads", response_model=LeadResponse)
def create_lead(user_id: str = Query(...), lead_data: LeadCreate = ..., db: Session = Depends(get_db)):
    """Create a new lead."""
    lead = Lead(
        id=str(uuid.uuid4()),
        owner_id=user_id,
        **lead_data.dict()
    )
    db.add(lead)
    db.commit()
    db.refresh(lead)
    return lead

@router.put("/leads/{lead_id}", response_model=LeadResponse)
def update_lead(lead_id: str, user_id: str = Query(...), lead_data: LeadUpdate = ..., db: Session = Depends(get_db)):
    """Update a lead."""
    lead = db.query(Lead).filter(Lead.id == lead_id, Lead.owner_id == user_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    update_data = lead_data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(lead, key, value)
    lead.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(lead)
    return lead

@router.delete("/leads/{lead_id}")
def delete_lead(lead_id: str, user_id: str = Query(...), db: Session = Depends(get_db)):
    """Delete a lead."""
    lead = db.query(Lead).filter(Lead.id == lead_id, Lead.owner_id == user_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    db.delete(lead)
    db.commit()
    return {"status": "deleted"}

# ==================== PRODUCTS ====================
@router.get("/products", response_model=list[ProductResponse])
def list_products(user_id: str = Query(...), db: Session = Depends(get_db)):
    """List all products for a user."""
    products = db.query(Product).filter(Product.owner_id == user_id).all()
    return products

@router.post("/products", response_model=ProductResponse)
def create_product(user_id: str = Query(...), product_data: ProductCreate = ..., db: Session = Depends(get_db)):
    """Create a new product."""
    # Check for duplicate SKU
    existing = db.query(Product).filter(Product.sku == product_data.sku).first()
    if existing:
        raise HTTPException(status_code=400, detail="Product with this SKU already exists")
    
    product = Product(
        id=str(uuid.uuid4()),
        owner_id=user_id,
        **product_data.dict()
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product

@router.put("/products/{product_id}", response_model=ProductResponse)
def update_product(product_id: str, user_id: str = Query(...), product_data: ProductUpdate = ..., db: Session = Depends(get_db)):
    """Update a product."""
    product = db.query(Product).filter(Product.id == product_id, Product.owner_id == user_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    update_data = product_data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(product, key, value)
    product.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(product)
    return product

@router.delete("/products/{product_id}")
def delete_product(product_id: str, user_id: str = Query(...), db: Session = Depends(get_db)):
    """Delete a product."""
    product = db.query(Product).filter(Product.id == product_id, Product.owner_id == user_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(product)
    db.commit()
    return {"status": "deleted"}

# ==================== CUSTOMERS ====================
@router.get("/customers", response_model=list[CustomerResponse])
def list_customers(user_id: str = Query(...), db: Session = Depends(get_db)):
    """List all customers for a user."""
    customers = db.query(Customer).filter(Customer.owner_id == user_id).all()
    return customers

@router.post("/customers", response_model=CustomerResponse)
def create_customer(user_id: str = Query(...), customer_data: CustomerCreate = ..., db: Session = Depends(get_db)):
    """Create a new customer."""
    customer = Customer(
        id=str(uuid.uuid4()),
        owner_id=user_id,
        **customer_data.dict()
    )
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer

# ==================== SALES ORDERS ====================
@router.get("/sales-orders", response_model=list[SalesOrderResponse])
def list_sales_orders(user_id: str = Query(...), db: Session = Depends(get_db)):
    """List all sales orders for a user."""
    orders = db.query(SalesOrder).filter(SalesOrder.owner_id == user_id).all()
    return orders

@router.post("/sales-orders", response_model=SalesOrderResponse)
def create_sales_order(user_id: str = Query(...), order_data: SalesOrderCreate = ..., db: Session = Depends(get_db)):
    """Create a new sales order."""
    order = SalesOrder(
        id=str(uuid.uuid4()),
        owner_id=user_id,
        **order_data.dict()
    )
    db.add(order)
    db.commit()
    db.refresh(order)
    return order
