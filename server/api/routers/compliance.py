from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import crud, schemas, database

router = APIRouter(prefix="/compliance", tags=["compliance"])

@router.get("/", response_model=List[schemas.ComplianceRecord])
def list_records(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    return crud.get_all_records(db, skip, limit)

@router.get("/supplier/{supplier_id}", response_model=List[schemas.ComplianceRecord])
def get_supplier_records(supplier_id: int, db: Session = Depends(database.get_db)):
    return crud.get_records_by_supplier(db, supplier_id)

@router.post("/", response_model=schemas.ComplianceRecord)
def create_record(record: schemas.ComplianceRecordCreate, db: Session = Depends(database.get_db)):
    return crud.create_compliance_record(db, record)

@router.delete("/{record_id}", response_model=schemas.ComplianceRecord)
def delete_record(record_id: int, db: Session = Depends(database.get_db)):
    result = crud.delete_compliance_record(db, record_id)
    if not result:
        raise HTTPException(404, detail="Record not found")
    return result

@router.put("/{record_id}", response_model=schemas.ComplianceRecord)
def update_record(record_id: int, record: schemas.ComplianceRecordUpdate, db: Session = Depends(database.get_db)):
    result = crud.update_compliance_record(db, record_id, record)
    if not result:
        raise HTTPException(404, detail="Record not found")
    return result
