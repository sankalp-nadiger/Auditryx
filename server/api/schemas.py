
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
        from_attributes = True 

# Supplier Schemas


class SupplierBase(BaseModel):
    name: str
    country: str
    city: Optional[str] = None
    contract_terms: Dict[str, str]
    risk_level: str
    status: Optional[str] = None
    compliance_score: Optional[int] = 0
    last_audit: Optional[date] = None


class SupplierCreate(SupplierBase):
    pass


class SupplierUpdate(BaseModel):
    name: Optional[str]
    country: Optional[str]
    city: Optional[str] = None
    contract_terms: Optional[Dict[str, str]]
    compliance_score: Optional[int]
    last_audit: Optional[date]
    risk_level: Optional[str]

    class Config:
        from_attributes = True 


class Supplier(SupplierBase):
    id: int
    compliance_score: Optional[int]
    last_audit: Optional[date]

    class Config:
        from_attributes = True 

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
        from_attributes = True 

class ComplianceRecord(ComplianceRecordBase):
    id: int

    class Config:
        from_attributes = True


