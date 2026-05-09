"""
Pydantic schemas for data import operations.
"""
from pydantic import BaseModel, Field
from typing import Dict, List, Any, Optional
from datetime import datetime
from app.models.import_history import ImportStatus, ImportType, DataSourceType

class FileUploadRequest(BaseModel):
    """Request for file upload."""
    filename: str
    file_content: bytes
    import_type: ImportType
    source_type: DataSourceType

class FieldMappingRequest(BaseModel):
    """Request to map source fields to target fields."""
    field_mapping: Dict[str, str]  # {source_field: target_field}
    default_values: Optional[Dict[str, Any]] = None
    validation_rules: Optional[Dict[str, Any]] = None

class PreviewRequest(BaseModel):
    """Request to preview import before execution."""
    filename: str
    file_content: bytes
    import_type: ImportType
    source_type: DataSourceType
    field_mapping: Dict[str, str]
    allow_duplicates: bool = False
    update_existing: bool = False

class PreviewResponse(BaseModel):
    """Response with preview of import data."""
    total_records: int
    valid_records: int
    error_records: int
    duplicate_count: int
    warnings: List[str]
    sample_data: List[Dict[str, Any]]
    errors: List[Dict[str, Any]]
    estimated_duration: str

class ExecuteImportRequest(BaseModel):
    """Request to execute import."""
    filename: str
    file_content: bytes
    import_type: ImportType
    source_type: DataSourceType
    field_mapping: Dict[str, str]
    allow_duplicates: bool = False
    update_existing: bool = False
    dry_run: bool = False

class ImportJobResponse(BaseModel):
    """Response with import job details."""
    id: str
    status: ImportStatus
    source_type: DataSourceType
    filename: str
    total_records: int
    successful_records: int
    failed_records: int
    skipped_records: int
    error_details: Optional[List[str]]
    created_at: datetime
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    
    class Config:
        from_attributes = True

class ImportHistoryResponse(BaseModel):
    """Response with import history."""
    jobs: List[ImportJobResponse]
    total_imports: int
    total_records_imported: int
    successful_imports: int
    failed_imports: int

class DuplicateCheckRequest(BaseModel):
    """Request to check for duplicates."""
    records: List[Dict[str, Any]]
    source_type: DataSourceType
    match_fields: List[str]
    fuzzy_match: bool = False

class DuplicateCheckResponse(BaseModel):
    """Response with duplicate information."""
    duplicates_found: int
    duplicate_details: Dict[int, List[str]]
    recommendations: List[str]

class FieldMappingTemplateResponse(BaseModel):
    """Response with field mapping template."""
    id: str
    name: str
    source_system: str
    source_type: DataSourceType
    field_mapping: Dict[str, str]
    duplicate_detection: Dict[str, Any]
    description: str
    version: str
    download_url: Optional[str]

class RollbackRequest(BaseModel):
    """Request to rollback an import."""
    job_id: str
    reason: Optional[str] = None

class RollbackResponse(BaseModel):
    """Response for rollback operation."""
    success: bool
    job_id: str
    rolled_back_at: datetime
    message: str
