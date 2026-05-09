"""
ARIS AI router - intelligent business analysis and chat interface.
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel

from app.core.database import get_db
from app.services.aris_service import ARISService

router = APIRouter(prefix="/api/v1/aris", tags=["ai-assistant"])

class ChatRequest(BaseModel):
    """Request schema for ARIS chat."""
    message: str
    include_context: Optional[bool] = True

class BusinessAnalysisRequest(BaseModel):
    """Request schema for business analysis."""
    leads: list = []
    products: list = []
    sales: list = []

@router.post("/analyze")
def analyze_business(
    user_id: str = Query(...),
    analysis_request: BusinessAnalysisRequest = ...,
    db: Session = Depends(get_db)
):
    """Get ARIS business analysis summary."""
    analysis = ARISService.summarize_business_state(
        analysis_request.leads,
        analysis_request.products,
        analysis_request.sales
    )
    return {
        "status": "success",
        "analysis": analysis,
        "user_id": user_id
    }

@router.post("/chat")
def chat_with_aris(
    user_id: str = Query(...),
    chat_request: ChatRequest = ...,
    leads: Optional[list] = Query(default=[]),
    products: Optional[list] = Query(default=[]),
    sales: Optional[list] = Query(default=[]),
    db: Session = Depends(get_db)
):
    """Chat with ARIS AI assistant."""
    context = {
        "leads": leads,
        "products": products,
        "sales": sales
    }
    
    response = ARISService.chat(chat_request.message, context)
    return {
        "status": "success",
        "message": chat_request.message,
        "response": response,
        "assistant": "ARIS",
        "user_id": user_id
    }
