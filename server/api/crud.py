from sqlalchemy.orm import Session
from . import models, schemas

def get_suppliers(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Supplier).filter(models.Supplier.user_id == user_id).offset(skip).limit(limit).all()

def get_supplier_by_id(db: Session, supplier_id: int):
    return db.query(models.Supplier).filter(models.Supplier.id == supplier_id).first()

def create_supplier(db: Session, supplier_in: schemas.SupplierCreate, user_id: int):
    try:
        db_obj = models.Supplier(**supplier_in.dict(), user_id=user_id)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        print("Supplier inserted successfully:", db_obj)
        return db_obj
    except Exception as e:
        db.rollback()
        print("Error inserting supplier:", e)
        raise

def update_supplier(db: Session, supplier_id: int, supplier_in: schemas.SupplierUpdate):
    db_obj = get_supplier_by_id(db, supplier_id)
    if not db_obj:
        return None
    for key, value in supplier_in.dict(exclude_unset=True).items():
        setattr(db_obj, key, value)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def delete_supplier(db: Session, supplier_id: int):
    db_obj = get_supplier_by_id(db, supplier_id)
    if not db_obj:
        return None
    db.delete(db_obj)
    db.commit()
    return db_obj

# CRUD functions for ComplianceRecord

def get_records_by_supplier(db: Session, supplier_id: int):
    return db.query(models.ComplianceRecord).filter(models.ComplianceRecord.supplier_id == supplier_id).all()

def get_all_records(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.ComplianceRecord).offset(skip).limit(limit).all()

def create_compliance_record(db: Session, record_in: schemas.ComplianceRecordCreate):
    db_obj = models.ComplianceRecord(**record_in.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def delete_compliance_record(db: Session, record_id: int):
    db_obj = db.query(models.ComplianceRecord).filter(models.ComplianceRecord.id == record_id).first()
    if not db_obj:
        return None
    db.delete(db_obj)
    db.commit()
    return db_obj

def update_compliance_record(db: Session, record_id: int, record_in: schemas.ComplianceRecordUpdate):
    record = db.query(models.ComplianceRecord).filter(models.ComplianceRecord.id == record_id).first()
    if not record:
        return None
    for key, value in record_in.dict(exclude_unset=True).items():
        setattr(record, key, value)
    db.commit()
    db.refresh(record)
    return record