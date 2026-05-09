"""
Main FastAPI application — Valorniq Enterprise SaaS OS
Migrated to lifespan context manager (replaces deprecated @app.on_event).
"""
from contextlib import asynccontextmanager
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import APP_NAME, APP_VERSION, API_V1_STR, BACKEND_CORS_ORIGINS
from app.core.database import init_db
from app.routers import auth, business, app_organization, aris, plans, import_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown lifecycle."""
    init_db()
    logger.info("✓ Database initialised")
    logger.info(f"✓ {APP_NAME} v{APP_VERSION} started")
    logger.info("✓ ARIS Intelligence System online")
    yield
    logger.info("✓ Shutdown complete")


app = FastAPI(
    title=APP_NAME,
    description="Valorniq — Enterprise SaaS Operating System with ARIS AI Counsel",
    version=APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ────────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(business.router)
app.include_router(app_organization.router)
app.include_router(aris.router)
app.include_router(plans.router)
app.include_router(import_router.router)


@app.get("/health", tags=["system"])
async def health_check():
    return {
        "status": "online",
        "application": APP_NAME,
        "version": APP_VERSION,
        "aris": "initialized",
    }


@app.get("/", tags=["system"])
async def root():
    return {
        "application": APP_NAME,
        "version": APP_VERSION,
        "api": API_V1_STR,
        "docs": "/docs",
        "status": "operational",
        "assistant": "ARIS (Artificial Reasoning Intelligence System)",
    }