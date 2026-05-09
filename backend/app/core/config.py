"""
Configuration module for Valorniq backend.
Handles environment variables and application settings.
"""
import os
from dotenv import load_dotenv

load_dotenv()

# Application settings
APP_NAME = "Valorniq"
APP_VERSION = "1.0.0"
API_V1_STR = "/api/v1"

# Security
SECRET_KEY = os.getenv("SECRET_KEY", "your-super-secret-key-change-this-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Database
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./valorniq.db")

# AI/ML Settings
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
ARIS_MODEL = "gemini-3-flash-preview"

# OAuth Providers (Stubs - implement real integration)
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "stub-google-client-id")
GITHUB_CLIENT_ID = os.getenv("GITHUB_CLIENT_ID", "stub-github-client-id")
MICROSOFT_CLIENT_ID = os.getenv("MICROSOFT_CLIENT_ID", "stub-microsoft-client-id")
APPLE_CLIENT_ID = os.getenv("APPLE_CLIENT_ID", "stub-apple-client-id")

# CORS
BACKEND_CORS_ORIGINS = os.getenv("BACKEND_CORS_ORIGINS", "http://localhost:3000,http://localhost:5173").split(",")

# Default Plans
DEFAULT_PLAN = "free"
PLAN_MODULES = {
    "free": ["dashboard", "appstore", "crm", "invoicing", "archives"],
    "business": ["dashboard", "appstore", "crm", "inventory", "sales", "finances", "billing", "payroll", "archives", "erp"],
    "enterprise": ["all"]
}
