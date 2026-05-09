"""
Plans and billing router.
FIXED: imports PLANS, APP_MODULES, PLAN_MODULES from config (where they now live).
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
    id: str
    name: str
    price: float
    features: List[str]
    description: str


class ModuleResponse(BaseModel):
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
            description=p["description"],
        )
        for p in PLANS
    ]


@router.get("/modules", response_model=List[ModuleResponse])
def list_all_modules():
    """List all available app modules."""
    return [
        ModuleResponse(
            id=m.id,
            name=m.name,
            category=m.category,
            description=m.description,
            icon=m.icon,
        )
        for m in APP_MODULES
    ]


@router.get("/current")
def get_current_plan(user_id: str = Query(...), db: Session = Depends(get_db)):
    """Get current plan details for a user."""
    user = AuthService.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    plan = next((p for p in PLANS if p["id"] == user.current_plan), PLANS[0])
    enabled = PLAN_MODULES.get(user.current_plan, PLAN_MODULES["free"])

    return {
        "current_plan": user.current_plan,
        "plan_details": plan,
        "enabled_modules": enabled,
    }


@router.post("/upgrade")
def upgrade_plan(
    user_id: str = Query(...),
    new_plan: str = Query(...),
    db: Session = Depends(get_db),
):
    """Upgrade a user to a new plan."""
    valid_ids = [p["id"] for p in PLANS]
    if new_plan not in valid_ids:
        raise HTTPException(status_code=400, detail=f"Invalid plan. Choose from: {valid_ids}")

    user = AuthService.upgrade_plan(db, user_id, new_plan)
    return {
        "status": "upgraded",
        "user_id": user.id,
        "new_plan": user.current_plan,
        "enabled_modules": PLAN_MODULES.get(user.current_plan, []),
    }