"""
Import history and job tracking models for data migration.
"""
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Enum, JSON, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.core.database import Base

class ImportStatus(str, enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    ROLLED_BACK = "rolled_back"

class ImportType(str, enum.Enum):
    CSV = "csv"
    EXCEL = "excel"
    JSON = "json"
    API = "api"

class DataSourceType(str, enum.Enum):
    LEADS = "leads"
    CUSTOMERS = "customers"
    PRODUCTS = "products"
    SALES_ORDERS = "sales_orders"
    INVOICES = "invoices"
    EXPENSES = "expenses"
    EMPLOYEES = "employees"
    SUBSCRIPTIONS = "subscriptions"
    PURCHASES = "purchases"
    VENDORS = "vendors"
    DOCUMENTS = "documents"

class ImportJob(Base):
    """Tracks data import jobs."""
    __tablename__ = "import_jobs"
    
    id = Column(String, primary_key=True, index=True)
    owner_id = Column(String, ForeignKey("users.id"))
    owner = relationship("User")
    
    # Import metadata
    source_type = Column(Enum(DataSourceType), index=True)  # What data type (leads, products, etc.)
    import_type = Column(Enum(ImportType))  # CSV, Excel, JSON
    filename = Column(String)
    
    # Status tracking
    status = Column(Enum(ImportStatus), default=ImportStatus.PENDING, index=True)
    total_records = Column(Integer, default=0)
    successful_records = Column(Integer, default=0)
    failed_records = Column(Integer, default=0)
    skipped_records = Column(Integer, default=0)
    
    # Results
    error_details = Column(JSON, nullable=True)  # List of errors
    warnings = Column(JSON, nullable=True)  # List of warnings
    duplicates_found = Column(Integer, default=0)
    
    # Field mapping
    field_mapping = Column(JSON)  # Maps source columns to target fields
    validation_rules = Column(JSON, nullable=True)  # Custom validation rules
    
    # Audit
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    rolled_back_at = Column(DateTime, nullable=True)
    
    # Transactional
    transaction_id = Column(String, nullable=True)  # For rollback capability
    allow_duplicates = Column(Boolean, default=False)
    update_existing = Column(Boolean, default=False)  # Update if duplicate found
    dry_run = Column(Boolean, default=False)  # Preview only

class FieldMapping(Base):
    """Stores field mappings for repeated imports."""
    __tablename__ = "field_mappings"
    
    id = Column(String, primary_key=True, index=True)
    owner_id = Column(String, ForeignKey("users.id"))
    owner = relationship("User")
    
    name = Column(String, index=True)  # e.g., "HubSpot CRM to Valorniq"
    source_type = Column(Enum(DataSourceType))
    source_system = Column(String)  # e.g., "HubSpot", "Salesforce", "Excel Template"
    
    # Mapping configuration
    mappings = Column(JSON)  # {sourceColumn: targetField}
    default_values = Column(JSON, nullable=True)  # Default values for unmapped fields
    transformation_rules = Column(JSON, nullable=True)  # Custom transformations
    
    # Metadata
    description = Column(String, nullable=True)
    is_template = Column(Boolean, default=False)  # Reusable template
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class DuplicateDetectionRule(Base):
    """Rules for duplicate detection during import."""
    __tablename__ = "duplicate_detection_rules"
    
    id = Column(String, primary_key=True, index=True)
    owner_id = Column(String, ForeignKey("users.id"))
    owner = relationship("User")
    
    source_type = Column(Enum(DataSourceType), index=True)
    
    # What fields to match on
    match_fields = Column(JSON)  # e.g., ["email"], ["sku"], ["name", "email"]
    
    # How to handle duplicates
    action_if_duplicate = Column(String, default="skip")  # skip, update, merge, create_new
    
    # Tolerance settings
    fuzzy_match = Column(Boolean, default=False)  # Fuzzy string matching
    case_sensitive = Column(Boolean, default=False)
    ignore_whitespace = Column(Boolean, default=True)
    
    # Merge/update strategy
    merge_strategy = Column(String, nullable=True)  # merge_first, merge_latest, merge_most_complete
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class ImportTemplate(Base):
    """Pre-built import templates for common systems."""
    __tablename__ = "import_templates"
    
    id = Column(String, primary_key=True, index=True)
    
    # Template metadata
    name = Column(String, index=True)  # "HubSpot CRM", "Salesforce Leads", "Excel Invoice Template"
    description = Column(String)
    source_system = Column(String)  # External system name
    source_type = Column(Enum(DataSourceType))
    
    # Pre-configured
    field_mapping = Column(JSON)  # Pre-set mappings
    duplicate_detection = Column(JSON)  # Pre-set duplicate rules
    validation_rules = Column(JSON, nullable=True)
    default_transformations = Column(JSON, nullable=True)
    
    # Version control
    version = Column(String, default="1.0")
    is_official = Column(Boolean, default=True)  # Official Valorniq template
    download_url = Column(String, nullable=True)  # CSV template download link
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
