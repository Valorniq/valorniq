"""
Plans and billing router - upgrade plans, list modules, manage subscriptions.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List

from app.core.database import get_db
from app.core.config import PLANS, APP_MODULES, PLAN_MODULES
from app.services.auth_service import AuthService

router = APIRouter(prefix="/api/v1/plans", tags=["billing"])

class PlanResponse(BaseModel):
    """Response schema for plan."""
    id: str
    name: str
    price: float
    features: List[str]
    description: str

class ModuleResponse(BaseModel):
    """Response schema for module."""
    id: str
    name: str
    category: str
    description: str
    icon: str

@router.get("/available", response_model=List[PlanResponse])
def list_plans():
    """List all available pricing plans."""
    return [
        PlanResponse(
            id=p["id"],
            name=p["name"],
            price=p["price"],
            features=p.get("features", []),
            description=p["description"]
        )
        for p in PLANS
    ]

@router.get("/modules", response_model=List[ModuleResponse])
def list_all_modules():
    """List all available modules."""
    return [
        ModuleResponse(
            id=m.id,
            name=m.name,
            category=m.category,
            description=m.description,
            icon=m.name
        )
        for m in APP_MODULES
    ]

@router.get("/current")
def get_current_plan(user_id: str = Query(...), db: Session = Depends(get_db)):
    """Get current plan for a user."""
    user = AuthService.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    plan = next((p for p in PLANS if p["id"] == user.current_plan), None)
    if not plan:
        plan = PLANS[0]  # Default to free
    
    return {
        "current_plan": user.current_plan,
        "plan_details": plan,
        "enabled_modules": PLAN_MODULES.get(user.current_plan, [])
    }

@router.post("/upgrade")
def upgrade_plan(user_id: str = Query(...), new_plan: str = Query(...), db: Session = Depends(get_db)):
    """Upgrade user to a new plan."""
    if new_plan not in [p["id"] for p in PLANS]:
        raise HTTPException(status_code=400, detail="Invalid plan")
    
    user = AuthService.upgrade_plan(db, user_id, new_plan)
    return {
        "status": "upgraded",
        "user_id": user.id,
        "new_plan": user.current_plan,
        "enabled_modules": PLAN_MODULES.get(user.current_plan, [])
    }
