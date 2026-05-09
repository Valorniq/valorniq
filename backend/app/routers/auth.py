"""
Authentication router - handles registration, login, OAuth, and token management.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta

from app.core.database import get_db
from app.core.security import create_access_token
from app.core.config import ACCESS_TOKEN_EXPIRE_MINUTES
from app.schemas.user import (
    UserRegister, UserLogin, UserResponse, TokenResponse, OAuthCallback, SSOStatus
)
from app.services.auth_service import AuthService

router = APIRouter(prefix="/api/v1/auth", tags=["authentication"])

@router.post("/register", response_model=TokenResponse)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """Register a new user with email and password."""
    try:
        user = AuthService.register_user(db, user_data)
        
        # Generate access token
        access_token = create_access_token(
            data={"sub": user.id, "email": user.email},
            expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user=UserResponse.from_orm(user)
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login", response_model=TokenResponse)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    """Login with email and password."""
    try:
        user = AuthService.login_user(db, login_data)
        
        access_token = create_access_token(
            data={"sub": user.id, "email": user.email},
            expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user=UserResponse.from_orm(user)
        )
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))

@router.post("/oauth/init/{provider}", response_model=SSOStatus)
def init_oauth(provider: str):
    """Initialize OAuth handshake for a provider."""
    if provider not in ["google", "github", "microsoft", "apple"]:
        raise HTTPException(status_code=400, detail="Invalid OAuth provider")
    
    return AuthService.init_oauth_handshake(provider)

@router.post("/oauth/callback", response_model=TokenResponse)
def oauth_callback(callback_data: OAuthCallback, db: Session = Depends(get_db)):
    """Process OAuth provider callback and return user token."""
    try:
        user = AuthService.process_oauth_callback(db, callback_data.provider, callback_data.code)
        
        access_token = create_access_token(
            data={"sub": user.id, "email": user.email},
            expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user=UserResponse.from_orm(user)
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"OAuth error: {str(e)}")

@router.get("/user/{user_id}", response_model=UserResponse)
def get_user(user_id: str, db: Session = Depends(get_db)):
    """Get user profile by ID."""
    user = AuthService.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserResponse.from_orm(user)
