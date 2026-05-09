"""
Configuration module for Valorniq backend.
Handles environment variables, application settings, and shared constants.
"""
import os
from typing import List, Dict, Any
from dataclasses import dataclass, field
from dotenv import load_dotenv

load_dotenv()

# ── Application ────────────────────────────────────────────────────────────────
APP_NAME = "Valorniq"
APP_VERSION = "1.0.0"
API_V1_STR = "/api/v1"

# ── Security ───────────────────────────────────────────────────────────────────
SECRET_KEY = os.getenv("SECRET_KEY", "your-super-secret-key-change-this-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# ── Database ───────────────────────────────────────────────────────────────────
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./valorniq.db")

# ── AI / ML ────────────────────────────────────────────────────────────────────
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
ARIS_MODEL = os.getenv("ARIS_MODEL", "gemini-1.5-flash")

# ── OAuth Providers ────────────────────────────────────────────────────────────
GOOGLE_CLIENT_ID     = os.getenv("GOOGLE_CLIENT_ID",     "")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")
GITHUB_CLIENT_ID     = os.getenv("GITHUB_CLIENT_ID",     "")
GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET", "")
MICROSOFT_CLIENT_ID  = os.getenv("MICROSOFT_CLIENT_ID",  "")
MICROSOFT_CLIENT_SECRET = os.getenv("MICROSOFT_CLIENT_SECRET", "")
APPLE_CLIENT_ID      = os.getenv("APPLE_CLIENT_ID",      "")

# ── CORS ───────────────────────────────────────────────────────────────────────
BACKEND_CORS_ORIGINS: List[str] = os.getenv(
    "BACKEND_CORS_ORIGINS",
    "http://localhost:3000,http://localhost:5173,http://127.0.0.1:5173"
).split(",")

# ── Environment ────────────────────────────────────────────────────────────────
APP_ENV = os.getenv("APP_ENV", "development")
IS_PRODUCTION = APP_ENV == "production"

# ── Plan / Module definitions ──────────────────────────────────────────────────

@dataclass
class AppModuleConfig:
    id: str
    name: str
    category: str
    description: str
    icon: str = "box"

PLANS: List[Dict[str, Any]] = [
    {
        "id": "free",
        "name": "Standard",
        "price": 0,
        "description": "Essential core for small teams",
        "features": [
            "Dashboard overview",
            "CRM & lead tracking",
            "Basic invoicing",
            "Archives access",
            "1 user profile",
        ],
    },
    {
        "id": "business",
        "name": "Business",
        "price": 49,
        "description": "Advanced sales and financial tools",
        "features": [
            "Everything in Standard",
            "Inventory control",
            "Sales orders & fulfilment",
            "Finance & accounting",
            "Billing & payroll",
            "ERP module",
        ],
    },
    {
        "id": "enterprise",
        "name": "Enterprise",
        "price": 199,
        "description": "Complete cross-region neural sync OS",
        "features": [
            "Everything in Business",
            "All 30+ modules",
            "ARIS AI counsel (full)",
            "24/7 priority sync",
            "Cross-region hosting",
            "Dedicated support",
        ],
    },
]

APP_MODULES: List[AppModuleConfig] = [
    # Sales
    AppModuleConfig("crm",           "CRM",                "Sales",       "Track leads and close opportunities",         "users"),
    AppModuleConfig("sales",         "Sales",              "Sales",       "Quotations, orders, and invoices",            "shopping-bag"),
    AppModuleConfig("pos",           "Point of Sale",      "Sales",       "Shops and restaurants",                       "store"),
    AppModuleConfig("subscriptions", "Subscriptions",      "Sales",       "Recurring invoices and renewals",             "refresh-ccw"),
    AppModuleConfig("rental",        "Rental",             "Sales",       "Contracts, deliveries, and returns",          "key"),
    # Finance
    AppModuleConfig("accounting",    "Accounting",         "Finance",     "Financial and analytic accounting",           "calculator"),
    AppModuleConfig("invoicing",     "Invoicing",          "Finance",     "Invoices and payments",                       "file-text"),
    AppModuleConfig("expenses",      "Expenses",           "Finance",     "Employee expense management",                 "receipt"),
    # Inventory
    AppModuleConfig("inventory",     "Inventory",          "Inventory",   "Stock and logistics",                         "package"),
    AppModuleConfig("manufacturing", "Manufacturing",      "Inventory",   "Manufacturing orders and BOMs",               "factory"),
    AppModuleConfig("plm",           "PLM",                "Inventory",   "Product lifecycle management",                "settings"),
    AppModuleConfig("purchase",      "Purchase",           "Inventory",   "Purchase orders and tenders",                 "truck"),
    # HR
    AppModuleConfig("employees",     "Employees",          "HR",          "Centralized employee information",            "users"),
    AppModuleConfig("recruitment",   "Recruitment",        "HR",          "Hiring pipelines",                            "user-plus"),
    AppModuleConfig("timeoff",       "Time Off",           "HR",          "PTO and leave requests",                      "calendar"),
    AppModuleConfig("appraisals",    "Appraisals",         "HR",          "Employee evaluations",                        "star"),
    AppModuleConfig("fleet",         "Fleet",              "HR",          "Vehicle and cost tracking",                   "car"),
    # Operations
    AppModuleConfig("maintenance",   "Maintenance",        "Operations",  "Equipment tracking and repair",               "settings"),
    AppModuleConfig("quality",       "Quality",            "Operations",  "Product quality control",                     "shield-check"),
    AppModuleConfig("project",       "Project",            "Operations",  "Plan and organize projects",                  "layers"),
    AppModuleConfig("scheduler",     "Scheduler",          "Operations",  "Employee schedules",                          "clock"),
    AppModuleConfig("appointments",  "Appointments",       "Operations",  "Booking meetings",                            "calendar"),
    AppModuleConfig("requests",      "Requests",           "Operations",  "Approval requests",                           "clipboard-check"),
    # Marketing
    AppModuleConfig("marketing",     "Marketing Analytics","Marketing",   "Email, SMS, and social metrics",              "bar-chart-3"),
    AppModuleConfig("events",        "Events",             "Marketing",   "Publish events and sell tickets",             "ticket"),
    AppModuleConfig("survey",        "Survey",             "Marketing",   "Live or shared surveys",                      "message-square"),
    # Productivity
    AppModuleConfig("documents",     "Documents",          "Productivity","Document management",                         "folder"),
    AppModuleConfig("spreadsheets",  "Spreadsheets",       "Productivity","Spreadsheet-style documents",                 "file-spreadsheet"),
    AppModuleConfig("sign",          "Sign",               "Productivity","Online document signing",                     "pen-tool"),
]

# ── Plan → module access map ───────────────────────────────────────────────────
PLAN_MODULES: Dict[str, List[str]] = {
    "free": [
        "dashboard", "appstore", "crm", "invoicing", "archives",
    ],
    "business": [
        "dashboard", "appstore", "crm", "inventory", "sales",
        "accounting", "invoicing", "expenses", "billing", "payroll",
        "archives", "erp",
    ],
    "enterprise": ["all"],
}

DEFAULT_PLAN = "free"