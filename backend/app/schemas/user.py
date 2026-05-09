"""
User schemas for API request/response validation.
"""
from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class UserRegister(BaseModel):
    """Schema for user registration (email/password)."""
    email: EmailStr
    password: str
    display_name: Optional[str] = None

class UserLogin(BaseModel):
    """Schema for user login."""
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    """Schema for user profile response."""
    id: str
    email: str
    display_name: Optional[str]
    phone: Optional[str]
    avatar_url: Optional[str]
    current_plan: str
    is_active: bool
    email_verified: bool
    created_at: datetime
    last_login: Optional[datetime]
    
    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    """Schema for auth token response."""
    access_token: str
    token_type: str
    user: UserResponse

class OAuthCallback(BaseModel):
    """Schema for OAuth callback processing."""
    provider: str  # 'google', 'github', 'microsoft', 'apple'
    code: str
    state: Optional[str] = None

class SSOStatus(BaseModel):
    """Schema for SSO status response."""
    provider: str
    status: str  # 'initialized', 'success', 'pending', 'error'
    message: str
