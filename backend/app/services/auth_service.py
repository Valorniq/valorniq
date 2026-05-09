"""
Authentication service with real and stub OAuth integration.
Handles user registration, login, token generation, and SSO handshakes.
"""
import uuid
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.core.security import hash_password, verify_password, create_access_token, decode_token
from app.core.config import PLAN_MODULES
from app.models.user import User
from app.models.app_organization import AppOrganization
from app.schemas.user import UserRegister, UserLogin, SSOStatus

class AuthService:
    """Authentication and user management service."""
    
    @staticmethod
    def register_user(db: Session, user_data: UserRegister) -> User:
        """Register a new user with email and password."""
        # Check if user exists
        existing_user = db.query(User).filter(User.email == user_data.email).first()
        if existing_user:
            raise ValueError("User with this email already exists")
        
        # Create new user
        user = User(
            id=str(uuid.uuid4()),
            email=user_data.email,
            display_name=user_data.display_name,
            password_hash=hash_password(user_data.password),
            current_plan="free"
        )
        
        # Initialize app organization
        app_org = AppOrganization(
            id=str(uuid.uuid4()),
            user_id=user.id,
            enabled_modules=PLAN_MODULES.get("free", [])
        )
        
        db.add(user)
        db.add(app_org)
        db.commit()
        db.refresh(user)
        return user
    
    @staticmethod
    def login_user(db: Session, login_data: UserLogin) -> User:
        """Authenticate user with email and password."""
        user = db.query(User).filter(User.email == login_data.email).first()
        if not user or not verify_password(login_data.password, user.password_hash or ""):
            raise ValueError("Invalid email or password")
        
        # Update last login
        user.last_login = datetime.utcnow()
        db.commit()
        return user
    
    @staticmethod
    def get_user_by_id(db: Session, user_id: str) -> User:
        """Retrieve user by ID."""
        return db.query(User).filter(User.id == user_id).first()
    
    @staticmethod
    def get_or_create_oauth_user(db: Session, provider: str, provider_id: str, email: str, display_name: str = None) -> User:
        """Get or create user from OAuth provider."""
        # Search by provider ID
        user = None
        if provider == "google":
            user = db.query(User).filter(User.google_id == provider_id).first()
        elif provider == "github":
            user = db.query(User).filter(User.github_id == provider_id).first()
        elif provider == "microsoft":
            user = db.query(User).filter(User.microsoft_id == provider_id).first()
        elif provider == "apple":
            user = db.query(User).filter(User.apple_id == provider_id).first()
        
        # If user not found by provider ID, search by email
        if not user:
            user = db.query(User).filter(User.email == email).first()
        
        # If still not found, create new user
        if not user:
            user = User(
                id=str(uuid.uuid4()),
                email=email,
                display_name=display_name,
                current_plan="free",
                email_verified=True  # OAuth emails are typically verified
            )
            
            # Link OAuth provider
            if provider == "google":
                user.google_id = provider_id
            elif provider == "github":
                user.github_id = provider_id
            elif provider == "microsoft":
                user.microsoft_id = provider_id
            elif provider == "apple":
                user.apple_id = provider_id
            
            # Initialize app organization
            app_org = AppOrganization(
                id=str(uuid.uuid4()),
                user_id=user.id,
                enabled_modules=PLAN_MODULES.get("free", [])
            )
            
            db.add(user)
            db.add(app_org)
            db.commit()
        else:
            # Link provider if not already linked
            if provider == "google" and not user.google_id:
                user.google_id = provider_id
            elif provider == "github" and not user.github_id:
                user.github_id = provider_id
            elif provider == "microsoft" and not user.microsoft_id:
                user.microsoft_id = provider_id
            elif provider == "apple" and not user.apple_id:
                user.apple_id = provider_id
            db.commit()
        
        user.last_login = datetime.utcnow()
        db.commit()
        return user
    
    @staticmethod
    def init_oauth_handshake(provider: str) -> SSOStatus:
        """
        Initialize OAuth handshake - returns status and instructions.
        This is a stub implementation for real OAuth providers.
        """
        return SSOStatus(
            provider=provider,
            status="initialized",
            message=f"OAuth handshake initialized for {provider}. "
                   f"In production, this would redirect to {provider}'s authorization endpoint. "
                   f"Client ID configured: stub-{provider}-client-id"
        )
    
    @staticmethod
    def process_oauth_callback(db: Session, provider: str, code: str) -> User:
        """
        Process OAuth provider callback - stub implementation.
        In production, this would:
        1. Exchange auth code for access token
        2. Fetch user profile from provider
        3. Create or link user account
        """
        # STUB: Simulate successful OAuth authentication
        stub_provider_user = {
            "google": {"id": f"google_{code[:8]}", "email": f"user_{code[:4]}@valorniq.dev", "name": "Google User"},
            "github": {"id": f"github_{code[:8]}", "email": f"user_{code[:4]}@valorniq.dev", "name": "GitHub User"},
            "microsoft": {"id": f"microsoft_{code[:8]}", "email": f"user_{code[:4]}@valorniq.dev", "name": "Microsoft User"},
            "apple": {"id": f"apple_{code[:8]}", "email": f"user_{code[:4]}@valorniq.dev", "name": "Apple User"},
        }
        
        provider_info = stub_provider_user.get(provider, {})
        return AuthService.get_or_create_oauth_user(
            db,
            provider,
            provider_info.get("id", f"{provider}_stub"),
            provider_info.get("email", f"user@valorniq.dev"),
            provider_info.get("name", f"{provider.capitalize()} User")
        )
    
    @staticmethod
    def upgrade_plan(db: Session, user_id: str, new_plan: str) -> User:
        """Upgrade user plan and update enabled modules."""
        user = AuthService.get_user_by_id(db, user_id)
        if not user:
            raise ValueError("User not found")
        
        user.current_plan = new_plan
        
        # Update app organization with new enabled modules
        app_org = db.query(AppOrganization).filter(AppOrganization.user_id == user_id).first()
        if app_org:
            app_org.enabled_modules = PLAN_MODULES.get(new_plan, [])
        
        db.commit()
        db.refresh(user)
        return user
