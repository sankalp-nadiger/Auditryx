from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import crud, schemas, database

router = APIRouter(prefix="/suppliers", tags=["suppliers"])

@router.get("/", response_model=List[schemas.Supplier])
def read_suppliers(skip: int=0, limit: int=100, db: Session=Depends(database.get_db)):
    return crud.get_suppliers(db, skip, limit)

@router.post("/", response_model=schemas.Supplier)
def add_supplier(supplier: schemas.SupplierCreate, db: Session=Depends(database.get_db)):
    return crud.create_supplier(db, supplier)

# GET /suppliers/{supplier_id}
@router.get("/{supplier_id}", response_model=schemas.Supplier)
def read_supplier(supplier_id: int, db: Session=Depends(database.get_db)):
    db_obj = crud.get_supplier_by_id(db, supplier_id)
    if not db_obj:
        raise HTTPException(404, f"Supplier {supplier_id} not found")
    return db_obj
