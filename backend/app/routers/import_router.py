"""
Data import router - handles CSV/Excel/JSON imports with validation and preview.
"""
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session
import uuid

from app.core.database import get_db
from app.services.import_service import DataImportService
from app.models.import_history import ImportJob, ImportStatus, ImportType, DataSourceType, ImportTemplate
from app.schemas.import_schemas import (
    PreviewResponse, ImportJobResponse, DuplicateCheckResponse,
    RollbackResponse, ImportHistoryResponse, FieldMappingTemplateResponse
)

router = APIRouter(prefix="/api/v1/import", tags=["import"])

# ==================== FILE UPLOAD & PREVIEW ====================

@router.post("/preview")
async def preview_import(
    user_id: str = Query(...),
    source_type: DataSourceType = Query(...),
    import_type: ImportType = Query(...),
    allow_duplicates: bool = Query(False),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Preview import data without committing.
    Returns sample data, validation errors, and duplicate warnings.
    """
    try:
        # Read file
        content = await file.read()
        
        # Parse file
        success, records, error = DataImportService.parse_import_file(
            content, file.filename, import_type
        )
        
        if not success:
            raise HTTPException(status_code=400, detail=f"Failed to parse file: {error}")
        
        if not records:
            raise HTTPException(status_code=400, detail="No records found in file")
        
        # Auto-detect field mapping from first record (simple heuristic)
        first_record = records[0]
        field_mapping = {key: key.lower().replace(' ', '_') for key in first_record.keys()}
        
        # Validate records
        valid_records, error_records = DataImportService.validate_records(
            records, source_type, field_mapping
        )
        
        # Check for duplicates
        duplicates_dict = DataImportService.find_duplicates(
            valid_records, db, source_type, user_id,
            match_fields=["email"] if source_type == DataSourceType.LEADS else ["sku"],
            fuzzy_match=False
        )
        
        duplicate_count = len(duplicates_dict)
        
        # Prepare response
        return PreviewResponse(
            total_records=len(records),
            valid_records=len(valid_records),
            error_records=len(error_records),
            duplicate_count=duplicate_count,
            warnings=[
                f"Found {duplicate_count} potential duplicates" if duplicate_count else "No duplicates detected",
                f"File will create {len(valid_records)} new records",
                f"{len(error_records)} records have validation errors"
            ] if error_records else ["All records look valid!"],
            sample_data=valid_records[:5],
            errors=error_records[:10],
            estimated_duration="2-5 minutes" if len(valid_records) > 1000 else "< 1 minute"
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Preview failed: {str(e)}")

# ==================== EXECUTE IMPORT ====================

@router.post("/execute", response_model=ImportJobResponse)
async def execute_import(
    user_id: str = Query(...),
    source_type: DataSourceType = Query(...),
    import_type: ImportType = Query(...),
    allow_duplicates: bool = Query(False),
    update_existing: bool = Query(False),
    dry_run: bool = Query(False),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Execute data import.
    Returns import job status and results.
    """
    try:
        # Read file
        content = await file.read()
        
        # Parse file
        success, records, error = DataImportService.parse_import_file(
            content, file.filename, import_type
        )
        
        if not success:
            raise HTTPException(status_code=400, detail=f"Failed to parse file: {error}")
        
        # Auto-detect field mapping
        first_record = records[0]
        field_mapping = {key: key.lower().replace(' ', '_') for key in first_record.keys()}
        
        # Validate records
        valid_records, error_records = DataImportService.validate_records(
            records, source_type, field_mapping
        )
        
        if not valid_records and error_records:
            raise HTTPException(
                status_code=400,
                detail=f"All {len(error_records)} records have validation errors"
            )
        
        # Create import job
        job_id = DataImportService.create_import_job(
            owner_id=user_id,
            source_type=source_type,
            import_type=import_type,
            filename=file.filename,
            field_mapping=field_mapping,
            db=db,
            allow_duplicates=allow_duplicates,
            update_existing=update_existing,
            dry_run=dry_run
        )
        
        # Execute import
        job = DataImportService.execute_import(
            job_id, valid_records, db, user_id, source_type
        )
        
        return ImportJobResponse.from_orm(job)
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Import failed: {str(e)}")

# ==================== IMPORT STATUS & HISTORY ====================

@router.get("/jobs/{job_id}", response_model=ImportJobResponse)
def get_import_job(
    job_id: str,
    user_id: str = Query(...),
    db: Session = Depends(get_db)
):
    """Get status of a specific import job."""
    job = db.query(ImportJob).filter(
        ImportJob.id == job_id,
        ImportJob.owner_id == user_id
    ).first()
    
    if not job:
        raise HTTPException(status_code=404, detail="Import job not found")
    
    return ImportJobResponse.from_orm(job)

@router.get("/history", response_model=ImportHistoryResponse)
def get_import_history(
    user_id: str = Query(...),
    source_type: DataSourceType = Query(None),
    limit: int = Query(50),
    db: Session = Depends(get_db)
):
    """Get import history for user."""
    jobs = DataImportService.get_import_history(user_id, db, source_type, limit)
    
    total_records = sum(job.successful_records for job in jobs)
    successful = len([j for j in jobs if j.status == ImportStatus.COMPLETED])
    failed = len([j for j in jobs if j.status == ImportStatus.FAILED])
    
    return ImportHistoryResponse(
        jobs=[ImportJobResponse.from_orm(j) for j in jobs],
        total_imports=len(jobs),
        total_records_imported=total_records,
        successful_imports=successful,
        failed_imports=failed
    )

# ==================== DUPLICATE DETECTION ====================

@router.post("/check-duplicates", response_model=DuplicateCheckResponse)
def check_duplicates(
    user_id: str = Query(...),
    source_type: DataSourceType = Query(...),
    db: Session = Depends(get_db),
    file: UploadFile = File(...),
):
    """Check for duplicates before importing."""
    try:
        content = file.read()
        success, records, error = DataImportService.parse_import_file(
            content, file.filename, ImportType.CSV
        )
        
        if not success:
            raise HTTPException(status_code=400, detail=f"Failed to parse file: {error}")
        
        # Determine match fields based on source type
        match_fields = {
            DataSourceType.LEADS: ["email"],
            DataSourceType.CUSTOMERS: ["email"],
            DataSourceType.PRODUCTS: ["sku"],
            DataSourceType.SALES_ORDERS: ["id"],
        }.get(source_type, ["email"])
        
        duplicates_dict = DataImportService.find_duplicates(
            records, db, source_type, user_id, match_fields
        )
        
        return DuplicateCheckResponse(
            duplicates_found=len(duplicates_dict),
            duplicate_details=duplicates_dict,
            recommendations=[
                f"Found {len(duplicates_dict)} duplicate entries",
                "Consider updating existing records instead of creating new ones",
                "Use fuzzy matching for approximate duplicates"
            ] if duplicates_dict else ["No duplicates detected - safe to import"]
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Duplicate check failed: {str(e)}")

# ==================== ROLLBACK ====================

@router.post("/rollback/{job_id}", response_model=RollbackResponse)
def rollback_import(
    job_id: str,
    user_id: str = Query(...),
    db: Session = Depends(get_db)
):
    """Rollback an import job."""
    job = db.query(ImportJob).filter(
        ImportJob.id == job_id,
        ImportJob.owner_id == user_id
    ).first()
    
    if not job:
        raise HTTPException(status_code=404, detail="Import job not found")
    
    if job.status not in [ImportStatus.COMPLETED, ImportStatus.IN_PROGRESS]:
        raise HTTPException(status_code=400, detail=f"Cannot rollback job with status: {job.status}")
    
    success = DataImportService.rollback_import(job_id, db)
    
    if not success:
        raise HTTPException(status_code=500, detail="Rollback failed")
    
    return RollbackResponse(
        success=True,
        job_id=job_id,
        rolled_back_at=db.query(ImportJob).filter(ImportJob.id == job_id).first().rolled_back_at,
        message=f"Import job {job_id} rolled back successfully"
    )

# ==================== IMPORT TEMPLATES ====================

@router.get("/templates", response_model=list[FieldMappingTemplateResponse])
def get_import_templates(
    source_type: DataSourceType = Query(None),
    db: Session = Depends(get_db)
):
    """Get available import templates."""
    query = db.query(ImportTemplate)
    
    if source_type:
        query = query.filter(ImportTemplate.source_type == source_type)
    
    templates = query.all()
    
    return [FieldMappingTemplateResponse.from_orm(t) for t in templates]

@router.get("/templates/{template_id}", response_model=FieldMappingTemplateResponse)
def get_import_template(
    template_id: str,
    db: Session = Depends(get_db)
):
    """Get a specific import template."""
    template = db.query(ImportTemplate).filter(ImportTemplate.id == template_id).first()
    
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    return FieldMappingTemplateResponse.from_orm(template)
