from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from typing import List
import pandas as pd
from dotenv import load_dotenv
import os
import google.generativeai as genai
from fastapi import APIRouter, HTTPException, Query
from .. import crud, schemas, database, models
load_dotenv() 

router = APIRouter(prefix="/suppliers", tags=["suppliers"])
GEMINI_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_KEY)


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
from datetime import datetime, timedelta
from fastapi import Query

@router.get("/{supplier_id}/metrics")
def get_supplier_metrics(
    supplier_id: int,
    db: Session = Depends(database.get_db),
    range: str = Query('6M', description="Range for metrics: 6M, 1Y, ALL")
):
    """
    Returns a list of dicts for charting and table:
    [
      {"id": ..., "month": "2025-01", "metric": ..., "value": ..., "status": ..., "date_recorded": ..., "notes": ...},
      ...
    ]
    """
    # Get all records for this supplier
    records = crud.get_records_by_supplier(db, supplier_id)
    if not records:
        return []

    # Prepare for chart: group by month, average value
    now = datetime.now()
    if range == '6M':
        start_date = now - timedelta(days=31*6)
    elif range == '1Y':
        start_date = now - timedelta(days=366)
    else:
        start_date = None

    # Filter records by date (ensure both are datetime)
    filtered = [
    r for r in records
    if not start_date or datetime.combine(r.date_recorded, datetime.min.time()) >= start_date
]


    # Group by month for chart
    month_map = {}
    for r in filtered:
        month = r.date_recorded.strftime('%Y-%m')
        if month not in month_map:
            month_map[month] = []
        month_map[month].append(r)

    chart_data = []
    for month in sorted(month_map.keys()):
        vals = [float(r.result) for r in month_map[month] if r.result is not None]
        avg = round(sum(vals)/len(vals), 1) if vals else None
        chart_data.append({
            "month": month,
            "value": avg,
        })

    # Table data: most recent 10 records (descending)
    table_data = [
        {
            "id": r.id,
            "metric": r.metric,
            "result": r.result,
            "status": r.status,
            "date_recorded": r.date_recorded.strftime('%Y-%m-%d'),
            "notes": getattr(r, 'notes', None),
        }
        for r in sorted(filtered, key=lambda x: x.date_recorded, reverse=True)[:10]
    ]

    # For frontend: send both chart and table data
    return {
        "chart": chart_data,
        "table": table_data
    }

@router.post("/check-compliance/{supplier_id}")
def check_compliance(supplier_id: int, db: Session = Depends(database.get_db)):
    try:
        reference_suppliers = pd.read_excel("uploads/Task_Supplier_Data.xlsx")
        reference_compliance = pd.read_excel("uploads/Task_Compliance_Records.xlsx")
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Reference Excel files not found")

    supplier = db.query(models.Supplier).filter(models.Supplier.id == supplier_id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")

    records = db.query(models.ComplianceRecord).filter(models.ComplianceRecord.supplier_id == supplier_id).all()
    if not records:
        raise HTTPException(status_code=404, detail="No compliance records found for this supplier.")

    compliance_summary = "\n".join([
        f"- {r.metric} on {r.date_recorded.strftime('%Y-%m-%d')}: {r.result} ({r.status})"
        for r in records[-5:]
    ])

    prompt = f"""
You are an expert supply chain compliance analyst.

Analyze the compliance performance of Supplier "{supplier.name}" (ID: {supplier_id}) in comparison to other suppliers using the dataset provided.

### Supplier Information:
- Country: {supplier.country}
- Risk Level: {supplier.risk_level}
- Status: {supplier.status}
- Compliance Score: {supplier.compliance_score}
- Last Audit: {supplier.last_audit}

### Supplier's Compliance Records:
{compliance_summary}

### Overall Dataset Snapshot (All Suppliers - Sample):
{reference_suppliers.head(15).to_string(index=False)}

### All Compliance Records (first 20 rows of dataset):
{reference_compliance.head(20).to_string(index=False)}

Please do not mention any limitations about the dataset size or content. Limit your response to a maximum of 4000 characters, and focus on actionable insights only.
Please answer:
1. How does Supplier {supplier_id}'s reliability compare to the average?
2. Are there any patterns of delays, failures, or inconsistencies?
3. Predict future reliability and risks.
4. Give a reliability score out of 10 and justify.
5. Recommend 2 action points for the compliance team.
"""

    try:
        model = genai.GenerativeModel('models/gemini-1.5-flash')
        gemini_response = model.generate_content(prompt)
        analysis = gemini_response.text.strip() if hasattr(gemini_response, 'text') else str(gemini_response)
        return {"analysis": analysis}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini error: {str(e)}")


@router.get("/insights")
def generate_supplier_insights(supplier_id: int = Query(...), db: Session = Depends(database.get_db)):
    try:
        reference_suppliers = pd.read_excel("uploads/Task_Supplier_Data.xlsx")
        reference_compliance = pd.read_excel("uploads/Task_Compliance_Records.xlsx")
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail="Reference Excel files not found")

    supplier = db.query(models.Supplier).filter(models.Supplier.id == supplier_id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")

    records = db.query(models.ComplianceRecord).filter(models.ComplianceRecord.supplier_id == supplier_id).all()
    if not records:
        raise HTTPException(status_code=404, detail="No compliance records found for this supplier.")

    history = "\n".join([
        f"- {r.metric} on {r.date_recorded.strftime('%Y-%m-%d')}: {r.result} ({r.status})"
        for r in records[-5:]
    ])

    prompt = f"""
You are a procurement compliance assistant.

Based on the following supplier details and compliance history, generate:

1. Key weaknesses or compliance issues.
2. At least 2 suggestions to improve the supplier's compliance.
3. Recommended contract term adjustments (like audit frequency, stricter penalties, incentives, etc.).

SUPPLIER INFO:
- Name: {supplier.name}
- Country: {supplier.country}
- Status: {supplier.status}
- Risk Level: {supplier.risk_level}
- Compliance Score: {supplier.compliance_score}
- Last Audit: {supplier.last_audit}

COMPLIANCE HISTORY (last 5 records):
{history}

REFERENCE DATA (first 15 suppliers & 20 compliance records):
{reference_suppliers.head(15).to_string(index=False)}

{reference_compliance.head(20).to_string(index=False)}

Please do not mention any limitations about the dataset size or content. Limit your response to a maximum of 4000 characters, and focus on actionable insights only.
"""

    try:
        model = genai.GenerativeModel('models/gemini-1.5-flash')
        gemini_response = model.generate_content(prompt)
        insights = gemini_response.text.strip() if hasattr(gemini_response, 'text') else str(gemini_response)
        return {
            "supplier": supplier.name,
            "insights": insights
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini processing failed: {str(e)}")
