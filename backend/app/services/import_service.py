"""
Data validation and import service for handling bulk data imports with duplicate detection,
field mapping, preview, and rollback capabilities.
"""
import csv
import json
import io
import uuid
from typing import List, Dict, Any, Tuple, Optional
from datetime import datetime
from difflib import SequenceMatcher
from sqlalchemy.orm import Session

from app.models.business import Lead, Product, Customer, SalesOrder
from app.models.import_history import (
    ImportJob, ImportStatus, ImportType, DataSourceType, ImportTemplate,
    FieldMapping, DuplicateDetectionRule
)
from app.schemas.business import LeadCreate, ProductCreate, CustomerCreate, SalesOrderCreate

class DataImportService:
    """Service for handling data imports with validation, deduplication, and preview."""
    
    # Model mapping for different data source types
    MODEL_MAP = {
        DataSourceType.LEADS: Lead,
        DataSourceType.CUSTOMERS: Customer,
        DataSourceType.PRODUCTS: Product,
        DataSourceType.SALES_ORDERS: SalesOrder,
    }
    
    SCHEMA_MAP = {
        DataSourceType.LEADS: LeadCreate,
        DataSourceType.CUSTOMERS: CustomerCreate,
        DataSourceType.PRODUCTS: ProductCreate,
        DataSourceType.SALES_ORDERS: SalesOrderCreate,
    }
    
    @staticmethod
    def validate_email(email: str) -> bool:
        """Validate email format."""
        import re
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None
    
    @staticmethod
    def validate_phone(phone: str) -> bool:
        """Validate phone number format."""
        import re
        # Accept international format variations
        pattern = r'^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$'
        return re.match(pattern, phone) is not None
    
    @staticmethod
    def validate_price(price: Any) -> Tuple[bool, Optional[float]]:
        """Validate and convert price to float."""
        try:
            p = float(price)
            return p >= 0, p if p >= 0 else None
        except (ValueError, TypeError):
            return False, None
    
    @staticmethod
    def fuzzy_match(str1: str, str2: str, threshold: float = 0.85) -> bool:
        """Check if two strings are similar enough (fuzzy matching)."""
        ratio = SequenceMatcher(None, str1.lower(), str2.lower()).ratio()
        return ratio >= threshold
    
    @staticmethod
    def normalize_string(s: str, ignore_whitespace: bool = True, case_sensitive: bool = False) -> str:
        """Normalize string for comparison."""
        if ignore_whitespace:
            s = s.strip()
        if not case_sensitive:
            s = s.lower()
        return s
    
    @classmethod
    def find_duplicates(
        cls,
        records: List[Dict[str, Any]],
        db: Session,
        source_type: DataSourceType,
        owner_id: str,
        match_fields: List[str],
        fuzzy_match: bool = False,
        case_sensitive: bool = False
    ) -> Dict[int, List[str]]:
        """
        Find duplicate records in database and within import batch.
        Returns dict mapping record index to list of duplicate record IDs/details.
        """
        duplicates = {}
        model = cls.MODEL_MAP.get(source_type)
        
        if not model:
            return duplicates
        
        for idx, record in enumerate(records):
            dup_list = []
            
            # Check for duplicates within batch
            for other_idx in range(idx):
                other_record = records[other_idx]
                match = True
                
                for field in match_fields:
                    val1 = str(record.get(field, "")).strip()
                    val2 = str(other_record.get(field, "")).strip()
                    
                    if not case_sensitive:
                        val1, val2 = val1.lower(), val2.lower()
                    
                    if fuzzy_match:
                        if not cls.fuzzy_match(val1, val2):
                            match = False
                            break
                    else:
                        if val1 != val2:
                            match = False
                            break
                
                if match:
                    dup_list.append(f"batch_record_{other_idx}")
            
            # Check database for duplicates
            for field in match_fields:
                field_value = record.get(field)
                if field_value:
                    query = db.query(model).filter(
                        model.owner_id == owner_id,
                        getattr(model, field) == field_value
                    )
                    
                    existing = query.first()
                    if existing:
                        dup_list.append(f"db_{existing.id}")
            
            if dup_list:
                duplicates[idx] = dup_list
        
        return duplicates
    
    @classmethod
    def parse_csv(cls, file_content: bytes) -> Tuple[bool, List[Dict[str, Any]], str]:
        """Parse CSV file and return records."""
        try:
            text = file_content.decode('utf-8')
            reader = csv.DictReader(io.StringIO(text))
            records = list(reader)
            return True, records, ""
        except Exception as e:
            return False, [], str(e)
    
    @classmethod
    def parse_json(cls, file_content: bytes) -> Tuple[bool, List[Dict[str, Any]], str]:
        """Parse JSON file and return records."""
        try:
            text = file_content.decode('utf-8')
            data = json.loads(text)
            
            if not isinstance(data, list):
                data = [data]
            
            return True, data, ""
        except Exception as e:
            return False, [], str(e)
    
    @classmethod
    def parse_import_file(
        cls,
        file_content: bytes,
        filename: str,
        import_type: ImportType
    ) -> Tuple[bool, List[Dict[str, Any]], str]:
        """Parse import file based on type."""
        if import_type == ImportType.CSV:
            return cls.parse_csv(file_content)
        elif import_type == ImportType.JSON:
            return cls.parse_json(file_content)
        else:
            return False, [], f"Unsupported import type: {import_type}"
    
    @classmethod
    def validate_records(
        cls,
        records: List[Dict[str, Any]],
        source_type: DataSourceType,
        field_mapping: Dict[str, str]
    ) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        """
        Validate records and return (valid_records, error_records).
        """
        valid = []
        errors = []
        
        for idx, record in enumerate(records):
            mapped_record = {}
            record_errors = []
            
            # Apply field mapping
            for source_field, target_field in field_mapping.items():
                if source_field in record:
                    value = record[source_field]
                    
                    # Type-specific validation
                    if target_field == "email" and value:
                        if not cls.validate_email(value):
                            record_errors.append(f"Invalid email format: {value}")
                        else:
                            mapped_record[target_field] = value
                    
                    elif target_field == "phone" and value:
                        if not cls.validate_phone(value):
                            record_errors.append(f"Invalid phone format: {value}")
                        else:
                            mapped_record[target_field] = value
                    
                    elif target_field in ["price", "estimated_value", "stock"] and value:
                        is_valid, converted = cls.validate_price(value)
                        if not is_valid:
                            record_errors.append(f"Invalid {target_field}: {value}")
                        else:
                            mapped_record[target_field] = converted
                    
                    elif target_field == "sku" and value:
                        # SKU must be unique and not empty
                        if not str(value).strip():
                            record_errors.append("SKU cannot be empty")
                        else:
                            mapped_record[target_field] = str(value).strip()
                    
                    else:
                        mapped_record[target_field] = value
            
            # Check required fields
            required_fields = cls._get_required_fields(source_type)
            for field in required_fields:
                if field not in mapped_record or not mapped_record[field]:
                    record_errors.append(f"Missing required field: {field}")
            
            if record_errors:
                errors.append({
                    "row": idx + 1,
                    "record": record,
                    "errors": record_errors
                })
            else:
                valid.append(mapped_record)
        
        return valid, errors
    
    @classmethod
    def _get_required_fields(cls, source_type: DataSourceType) -> List[str]:
        """Get required fields for each data source type."""
        required = {
            DataSourceType.LEADS: ["name"],
            DataSourceType.CUSTOMERS: ["name", "email"],
            DataSourceType.PRODUCTS: ["name", "sku", "price"],
            DataSourceType.SALES_ORDERS: ["customer_id", "items", "total_value"],
        }
        return required.get(source_type, [])
    
    @classmethod
    def create_import_job(
        cls,
        owner_id: str,
        source_type: DataSourceType,
        import_type: ImportType,
        filename: str,
        field_mapping: Dict[str, str],
        db: Session,
        allow_duplicates: bool = False,
        update_existing: bool = False,
        dry_run: bool = False
    ) -> str:
        """Create and return import job ID."""
        job_id = str(uuid.uuid4())
        
        job = ImportJob(
            id=job_id,
            owner_id=owner_id,
            source_type=source_type,
            import_type=import_type,
            filename=filename,
            field_mapping=field_mapping,
            allow_duplicates=allow_duplicates,
            update_existing=update_existing,
            dry_run=dry_run,
            status=ImportStatus.PENDING
        )
        
        db.add(job)
        db.commit()
        
        return job_id
    
    @classmethod
    def execute_import(
        cls,
        job_id: str,
        records: List[Dict[str, Any]],
        db: Session,
        owner_id: str,
        source_type: DataSourceType
    ) -> ImportJob:
        """Execute the import and update job status."""
        job = db.query(ImportJob).filter(ImportJob.id == job_id).first()
        
        if not job:
            raise ValueError(f"Import job {job_id} not found")
        
        job.status = ImportStatus.IN_PROGRESS
        job.started_at = datetime.utcnow()
        job.total_records = len(records)
        db.commit()
        
        try:
            model = cls.MODEL_MAP.get(source_type)
            
            if not model:
                raise ValueError(f"Unsupported source type: {source_type}")
            
            successful = 0
            failed = 0
            errors = []
            
            for record in records:
                try:
                    # Create model instance
                    new_record = model(
                        id=str(uuid.uuid4()),
                        owner_id=owner_id,
                        **record
                    )
                    
                    db.add(new_record)
                    successful += 1
                
                except Exception as e:
                    failed += 1
                    errors.append(str(e))
            
            # Commit all or rollback
            if not job.dry_run:
                db.commit()
                job.status = ImportStatus.COMPLETED
            else:
                db.rollback()
                job.status = ImportStatus.COMPLETED
            
            job.successful_records = successful
            job.failed_records = failed
            job.completed_at = datetime.utcnow()
            
            if errors:
                job.error_details = errors[:10]  # Store first 10 errors
            
            db.commit()
            
        except Exception as e:
            job.status = ImportStatus.FAILED
            job.error_details = [str(e)]
            job.completed_at = datetime.utcnow()
            db.rollback()
            db.commit()
        
        return job
    
    @classmethod
    def rollback_import(cls, job_id: str, db: Session) -> bool:
        """Rollback an import job (mark as rolled back - actual deletion would require transaction support)."""
        job = db.query(ImportJob).filter(ImportJob.id == job_id).first()
        
        if not job:
            return False
        
        # In production, this would use database transactions to actually rollback
        # For now, we mark it as rolled back
        job.status = ImportStatus.ROLLED_BACK
        job.rolled_back_at = datetime.utcnow()
        db.commit()
        
        return True
    
    @classmethod
    def get_import_history(
        cls,
        owner_id: str,
        db: Session,
        source_type: Optional[DataSourceType] = None,
        limit: int = 50
    ) -> List[ImportJob]:
        """Get import history for a user."""
        query = db.query(ImportJob).filter(ImportJob.owner_id == owner_id)
        
        if source_type:
            query = query.filter(ImportJob.source_type == source_type)
        
        return query.order_by(ImportJob.created_at.desc()).limit(limit).all()
