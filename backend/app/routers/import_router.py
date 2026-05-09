"""
Data import router.
FIXED: check-duplicates endpoint now uses `await file.read()` (was sync).
"""
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session
import uuid

from app.core.database import get_db
from app.services.import_service import DataImportService
from app.models.import_history import (
    ImportJob, ImportStatus, ImportType, DataSourceType, ImportTemplate,
)
from app.schemas.import_schemas import (
    PreviewResponse, ImportJobResponse, DuplicateCheckResponse,
    RollbackResponse, ImportHistoryResponse, FieldMappingTemplateResponse,
)

router = APIRouter(prefix="/api/v1/import", tags=["import"])


# ── Preview ────────────────────────────────────────────────────────────────────

@router.post("/preview", response_model=PreviewResponse)
async def preview_import(
    user_id: str = Query(...),
    source_type: DataSourceType = Query(...),
    import_type: ImportType = Query(...),
    allow_duplicates: bool = Query(False),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """Preview import data without committing — returns validation errors and duplicate warnings."""
    try:
        content = await file.read()

        success, records, error = DataImportService.parse_import_file(
            content, file.filename or "upload", import_type
        )
        if not success:
            raise HTTPException(status_code=400, detail=f"Failed to parse file: {error}")
        if not records:
            raise HTTPException(status_code=400, detail="No records found in file")

        first_record = records[0]
        field_mapping = {key: key.lower().replace(" ", "_") for key in first_record.keys()}

        valid_records, error_records = DataImportService.validate_records(
            records, source_type, field_mapping
        )

        match_fields = ["email"] if source_type in (DataSourceType.LEADS, DataSourceType.CUSTOMERS) else ["sku"]
        duplicates_dict = DataImportService.find_duplicates(
            valid_records, db, source_type, user_id,
            match_fields=match_fields,
            fuzzy_match=False,
        )
        duplicate_count = len(duplicates_dict)

        warnings = []
        if duplicate_count:
            warnings.append(f"Found {duplicate_count} potential duplicate(s)")
        if error_records:
            warnings.append(f"{len(error_records)} record(s) have validation errors")
        if not warnings:
            warnings.append("All records look valid!")

        return PreviewResponse(
            total_records=len(records),
            valid_records=len(valid_records),
            error_records=len(error_records),
            duplicate_count=duplicate_count,
            warnings=warnings,
            sample_data=valid_records[:5],
            errors=error_records[:10],
            estimated_duration="2-5 minutes" if len(valid_records) > 1000 else "< 1 minute",
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Preview failed: {str(e)}")


# ── Execute ────────────────────────────────────────────────────────────────────

@router.post("/execute", response_model=ImportJobResponse)
async def execute_import(
    user_id: str = Query(...),
    source_type: DataSourceType = Query(...),
    import_type: ImportType = Query(...),
    allow_duplicates: bool = Query(False),
    update_existing: bool = Query(False),
    dry_run: bool = Query(False),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """Execute a data import and return the resulting job record."""
    try:
        content = await file.read()

        success, records, error = DataImportService.parse_import_file(
            content, file.filename or "upload", import_type
        )
        if not success:
            raise HTTPException(status_code=400, detail=f"Failed to parse file: {error}")

        first_record = records[0] if records else {}
        field_mapping = {key: key.lower().replace(" ", "_") for key in first_record.keys()}

        valid_records, error_records = DataImportService.validate_records(
            records, source_type, field_mapping
        )

        if not valid_records and error_records:
            raise HTTPException(
                status_code=400,
                detail=f"All {len(error_records)} records have validation errors",
            )

        job_id = DataImportService.create_import_job(
            owner_id=user_id,
            source_type=source_type,
            import_type=import_type,
            filename=file.filename or "upload",
            field_mapping=field_mapping,
            db=db,
            allow_duplicates=allow_duplicates,
            update_existing=update_existing,
            dry_run=dry_run,
        )

        job = DataImportService.execute_import(
            job_id, valid_records, db, user_id, source_type
        )
        return ImportJobResponse.from_orm(job)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Import failed: {str(e)}")


# ── Status & history ───────────────────────────────────────────────────────────

@router.get("/jobs/{job_id}", response_model=ImportJobResponse)
def get_import_job(job_id: str, user_id: str = Query(...), db: Session = Depends(get_db)):
    job = db.query(ImportJob).filter(
        ImportJob.id == job_id, ImportJob.owner_id == user_id
    ).first()
    if not job:
        raise HTTPException(status_code=404, detail="Import job not found")
    return ImportJobResponse.from_orm(job)


@router.get("/history", response_model=ImportHistoryResponse)
def get_import_history(
    user_id: str = Query(...),
    source_type: DataSourceType = Query(None),
    limit: int = Query(50, le=200),
    db: Session = Depends(get_db),
):
    jobs = DataImportService.get_import_history(user_id, db, source_type, limit)
    total_records = sum(j.successful_records for j in jobs)
    return ImportHistoryResponse(
        jobs=[ImportJobResponse.from_orm(j) for j in jobs],
        total_imports=len(jobs),
        total_records_imported=total_records,
        successful_imports=sum(1 for j in jobs if j.status == ImportStatus.COMPLETED),
        failed_imports=sum(1 for j in jobs if j.status == ImportStatus.FAILED),
    )


# ── Duplicate check ────────────────────────────────────────────────────────────

@router.post("/check-duplicates", response_model=DuplicateCheckResponse)
async def check_duplicates(           # FIXED: was sync, UploadFile requires async
    user_id: str = Query(...),
    source_type: DataSourceType = Query(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    try:
        content = await file.read()   # FIXED: was file.read() — TypeError in async context
        success, records, error = DataImportService.parse_import_file(
            content, file.filename or "upload", ImportType.CSV
        )
        if not success:
            raise HTTPException(status_code=400, detail=f"Failed to parse file: {error}")

        match_fields_map = {
            DataSourceType.LEADS:       ["email"],
            DataSourceType.CUSTOMERS:   ["email"],
            DataSourceType.PRODUCTS:    ["sku"],
            DataSourceType.SALES_ORDERS: ["id"],
        }
        match_fields = match_fields_map.get(source_type, ["email"])

        duplicates_dict = DataImportService.find_duplicates(
            records, db, source_type, user_id, match_fields
        )

        if duplicates_dict:
            recommendations = [
                f"Found {len(duplicates_dict)} duplicate entr{'y' if len(duplicates_dict) == 1 else 'ies'}",
                "Consider updating existing records instead of creating new ones",
                "Enable fuzzy matching to catch near-duplicates",
            ]
        else:
            recommendations = ["No duplicates detected — safe to import"]

        return DuplicateCheckResponse(
            duplicates_found=len(duplicates_dict),
            duplicate_details=duplicates_dict,
            recommendations=recommendations,
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Duplicate check failed: {str(e)}")


# ── Rollback ───────────────────────────────────────────────────────────────────

@router.post("/rollback/{job_id}", response_model=RollbackResponse)
def rollback_import(
    job_id: str,
    user_id: str = Query(...),
    db: Session = Depends(get_db),
):
    job = db.query(ImportJob).filter(
        ImportJob.id == job_id, ImportJob.owner_id == user_id
    ).first()
    if not job:
        raise HTTPException(status_code=404, detail="Import job not found")
    if job.status not in (ImportStatus.COMPLETED, ImportStatus.IN_PROGRESS):
        raise HTTPException(
            status_code=400,
            detail=f"Cannot rollback a job with status '{job.status}'"
        )

    success = DataImportService.rollback_import(job_id, db)
    if not success:
        raise HTTPException(status_code=500, detail="Rollback failed")

    db.refresh(job)
    return RollbackResponse(
        success=True,
        job_id=job_id,
        rolled_back_at=job.rolled_back_at,
        message=f"Import job {job_id} rolled back successfully",
    )


# ── Templates ──────────────────────────────────────────────────────────────────

@router.get("/templates", response_model=list[FieldMappingTemplateResponse])
def get_import_templates(
    source_type: DataSourceType = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(ImportTemplate)
    if source_type:
        query = query.filter(ImportTemplate.source_type == source_type)
    return [FieldMappingTemplateResponse.from_orm(t) for t in query.all()]


@router.get("/templates/{template_id}", response_model=FieldMappingTemplateResponse)
def get_import_template(template_id: str, db: Session = Depends(get_db)):
    t = db.query(ImportTemplate).filter(ImportTemplate.id == template_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Template not found")
    return FieldMappingTemplateResponse.from_orm(t)