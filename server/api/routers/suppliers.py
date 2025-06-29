from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import crud, schemas, database

router = APIRouter(prefix="/suppliers", tags=["suppliers"])

from fastapi import Request

@router.get("/", response_model=List[schemas.Supplier])
async def read_suppliers(request: Request, skip: int=0, limit: int=100, db: Session=Depends(database.get_db)):
    user_id = int(request.headers.get("x-user-id", 1))
    print("Fetching suppliers for user_id:", user_id)
    return crud.get_suppliers(db, user_id, skip, limit)

from fastapi import Request

@router.post("/", response_model=schemas.Supplier)
async def add_supplier(request: Request, supplier: schemas.SupplierCreate, db: Session=Depends(database.get_db)):
    user_id = int(request.headers.get("x-user-id", 1))
    print("Received supplier data:", supplier.dict(), "user_id:", user_id)
    try:
        result = crud.create_supplier(db, supplier, user_id)
        return result
    except Exception as e:
        print("Exception in add_supplier:", e)
        raise HTTPException(status_code=500, detail=f"Failed to add supplier: {e}")


# GET /suppliers/{supplier_id}
@router.get("/{supplier_id}", response_model=schemas.Supplier)
def read_supplier(supplier_id: int, db: Session=Depends(database.get_db)):
    db_obj = crud.get_supplier_by_id(db, supplier_id)
    if not db_obj:
        raise HTTPException(404, f"Supplier {supplier_id} not found")
    return db_obj

# GET /suppliers/{supplier_id}/metrics
@router.get("/{supplier_id}/metrics", response_model=List[schemas.ComplianceRecord])
def get_supplier_metrics(supplier_id: int, db: Session=Depends(database.get_db)):
    records = crud.get_records_by_supplier(db, supplier_id)
    return records
