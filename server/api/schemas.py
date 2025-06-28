from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import date

class UserBase(BaseModel):
    email: str
    full_name: Optional[str]

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    class Config:
        orm_mode = True

# Supplier Schemas

class SupplierBase(BaseModel):
    name: str
    country: str
    contract_terms: Dict[str, str]

class SupplierCreate(SupplierBase):
    pass

class SupplierUpdate(BaseModel):
    name: Optional[str]
    country: Optional[str]
    contract_terms: Optional[Dict[str, str]]
    compliance_score: Optional[int]
    last_audit: Optional[date]

    class Config:
        orm_mode = True

class Supplier(SupplierBase):
    id: int
    compliance_score: Optional[int]
    last_audit: Optional[date]

    class Config:
        orm_mode = True

# ComplianceRecord Schemas 

class ComplianceRecordBase(BaseModel):
    supplier_id: int
    metric: str
    date_recorded: date
    result: Optional[float]
    status: str 

class ComplianceRecordCreate(ComplianceRecordBase):
    pass

class ComplianceRecordUpdate(BaseModel):
    metric: Optional[str]
    date_recorded: Optional[date]
    result: Optional[float]
    status: Optional[str]

    class Config:
        orm_mode = True

class ComplianceRecord(ComplianceRecordBase):
    id: int

    class Config:
        orm_mode = True
