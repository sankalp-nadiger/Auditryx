
from sqlalchemy import Column, Integer, String, Date, ForeignKey, JSON, Float
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)

from sqlalchemy import ForeignKey

class Supplier(Base):
    __tablename__ = "suppliers"
    id              = Column(Integer, primary_key=True, index=True)
    name            = Column(String, nullable=False)
    country         = Column(String, nullable=False)
    contract_terms  = Column(JSON, nullable=False)
    compliance_score= Column(Integer, default=0)
    last_audit      = Column(Date, nullable=True)
    risk_level      = Column(String, nullable=True)
    user_id         = Column(Integer, ForeignKey("users.id"), nullable=False)
    records         = relationship("ComplianceRecord", back_populates="supplier")

class ComplianceRecord(Base):
    __tablename__ = "compliance_records"
    id              = Column(Integer, primary_key=True, index=True)
    supplier_id     = Column(Integer, ForeignKey("suppliers.id"), nullable=False)
    metric          = Column(String, nullable=False)
    date_recorded   = Column(Date, nullable=False)
    result          = Column(Float, nullable=True)
    status          = Column(String, nullable=False)
    supplier        = relationship("Supplier", back_populates="records")
