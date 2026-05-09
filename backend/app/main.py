"""
Main FastAPI application - Valorniq Enterprise SaaS OS
Python backend with ARIS AI assistant integration
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.core.config import APP_NAME, APP_VERSION, API_V1_STR, BACKEND_CORS_ORIGINS
from app.core.database import init_db
from app.routers import auth, business, app_organization, aris, plans, import_router

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title=APP_NAME,
    description="Valorniq - Enterprise SaaS Operating System with ARIS AI Counsel",
    version=APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    """Initialize database tables on application startup."""
    init_db()
    logger.info("✓ Database initialized")
    logger.info(f"✓ {APP_NAME} v{APP_VERSION} started successfully")
    logger.info(f"✓ ARIS AI Intelligence System online")

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "online",
        "application": APP_NAME,
        "version": APP_VERSION,
        "aris": "initialized"
    }

# Include routers
app.include_router(auth.router)
app.include_router(business.router)
app.include_router(app_organization.router)
app.include_router(aris.router)
app.include_router(plans.router)
app.include_router(import_router.router)

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "application": APP_NAME,
        "version": APP_VERSION,
        "description": "Enterprise SaaS Operating System",
        "api_version": API_V1_STR,
        "docs": "/docs",
        "status": "operational",
        "assistant": "ARIS (Artificial Reasoning Intelligence System)"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
