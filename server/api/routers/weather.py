from fastapi import APIRouter, HTTPException, Query, Depends, Body
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import httpx, os
import google.generativeai as genai
from datetime import datetime
from dotenv import load_dotenv
from .. import models, database
import pandas as pd
import re
import math

load_dotenv()

router = APIRouter(prefix="/weather", tags=["weather"])

OW_API_KEY = os.getenv("OPENWEATHER_API_KEY")
GEMINI_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_KEY)


BASE_URL = "https://api.openweathermap.org/data/2.5"

def get_coordinates_for_city(city: str):
    geo_url = f"http://api.openweathermap.org/geo/1.0/direct?q={city}&limit=1&appid={OW_API_KEY}"
    res = httpx.get(geo_url).json()
    if not res:
        raise HTTPException(status_code=404, detail="City not found")
    return res[0]["lat"], res[0]["lon"]

@router.get("/today/{supplier_id}")
def get_today_weather(supplier_id: int, db: Session = Depends(database.get_db)):
    supplier = db.query(models.Supplier).filter(models.Supplier.id == supplier_id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    # Use city for coordinates if available, else fallback to country
    city = getattr(supplier, 'city', None) or supplier.country
    lat, lon = get_coordinates_for_city(city)
    weather_url = f"{BASE_URL}/weather?lat={lat}&lon={lon}&appid={OW_API_KEY}&units=metric"
    data = httpx.get(weather_url).json()
    return {
        "supplier": supplier.name,
        "location": city,
        "lat": lat,
        "lon": lon,
        "condition": data["weather"][0]["description"],
        "temperature": data["main"]["temp"],
        "humidity": data["main"].get("humidity")
    }

@router.get("/history/{supplier_id}")
def get_weather_history(supplier_id: int, db: Session = Depends(database.get_db)):
    supplier = db.query(models.Supplier).filter(models.Supplier.id == supplier_id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")

    # Use city for coordinates if available, else fallback to country
    city = getattr(supplier, 'city', None) or supplier.country
    lat, lon = get_coordinates_for_city(city)
    end = int(datetime.now().timestamp())
    results = []
    for i in range(1, 8):
        dt = end - i * 86400
        url = f"https://api.openweathermap.org/data/3.0/onecall/timemachine?lat={lat}&lon={lon}&dt={dt}&appid={OW_API_KEY}&units=metric"
        res = httpx.get(url).json()
        if "current" in res:
            current = res["current"]
            results.append({
                "date": str(datetime.fromtimestamp(dt).date()),
                "temperature": current.get("temp"),
                "condition": current.get("weather", [{}])[0].get("description", ""),
                "humidity": current.get("humidity")
            })
    return {
        "supplier": supplier.name,
        "location": city,
        "history": results
    }

@router.get("/recommend-supplier/")
def recommend_supplier(
    user_lat: float = Query(...),
    user_lon: float = Query(...),
    db: Session = Depends(database.get_db)
):
    def haversine(lat1, lon1, lat2, lon2):
        R = 6371  # Earth radius in km
        phi1, phi2 = math.radians(lat1), math.radians(lat2)
        delta_phi = math.radians(lat2 - lat1)
        delta_lambda = math.radians(lon2 - lon1)

        a = math.sin(delta_phi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2) ** 2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return R * c

    suppliers = db.query(models.Supplier).all()
    suggestions = []
    best_score = -1
    best_supplier_data = None

    try:
        reference_compliance_df = pd.read_excel("uploads/Task_Compliance_Records.xlsx")
        reference_snapshot = reference_compliance_df.head(15).to_string(index=False)
    except Exception:
        raise HTTPException(status_code=500, detail="Static compliance dataset not found in /uploads.")

    for supplier in suppliers:
        try:
            lat, lon = get_coordinates_for_city(supplier.city)
            distance_km = haversine(user_lat, user_lon, lat, lon)

            weather_url = f"{BASE_URL}/weather?lat={lat}&lon={lon}&appid={OW_API_KEY}&units=metric"
            data = httpx.get(weather_url).json()
            weather = data["weather"][0]["description"]
            temp = data["main"]["temp"]

            records = db.query(models.ComplianceRecord).filter(models.ComplianceRecord.supplier_id == supplier.id).all()
            db_compliance_summary = "\n".join([
                f"- {r.metric} on {r.date_recorded}: {r.result} ({r.status})"
                for r in records[-5:]
            ]) if records else "No compliance records found."

            prompt = f"""
You are evaluating suppliers for a procurement system.

Below is a REFERENCE dataset of past supplier compliance examples:
{reference_snapshot}
Please do not mention any limitations about the dataset size or content. Limit your response to a maximum of 4000 characters, and focus on actionable insights only.

Now evaluate this LIVE supplier:
- Name: {supplier.name}
- Country: {supplier.country}
- Risk Level: {supplier.risk_level}
- Status: {supplier.status}
- Current Weather: {weather}, {temp}°C
- Distance from user: {distance_km:.2f} km

RECENT COMPLIANCE HISTORY:
{db_compliance_summary}

Return:
1. Feasibility score (out of 10)
2. Strengths & risks
3. Should the user select them today?
4. Recommended action (approve, monitor, avoid)
"""

            model = genai.GenerativeModel('models/gemini-1.5-flash')
            gemini_response = model.generate_content(prompt)
            recommendation = gemini_response.text.strip() if hasattr(gemini_response, 'text') else str(gemini_response)

            # Try to extract feasibility score using regex
            score_match = re.search(r"(\d+(?:\.\d+)?)\s*/\s*10", recommendation)
            score = float(score_match.group(1)) if score_match else 0

            supplier_info = {
                "supplier": supplier.name,
                "weather": weather,
                "temperature": temp,
                "distance_km": round(distance_km, 2),
                "risk_level": supplier.risk_level,
                "status": supplier.status,
                "feasibility_score": score,
                "recommendation": recommendation
            }

            if score > best_score:
                best_score = score
                best_supplier_data = supplier_info

            suggestions.append(supplier_info)

        except Exception as e:
            suggestions.append({
                "supplier": supplier.name,
                "error": f"Failed to evaluate: {str(e)}"
            })

    return {
        "results": suggestions,
        "best_supplier": best_supplier_data
    }

@router.post("/check-weather-impact")
async def check_weather_impact(
    supplier_id: int = Body(...),
    latitude: float = Body(...),
    longitude: float = Body(...),
    delivery_date: str = Body(...),
    db: Session = Depends(database.get_db)
):
    """
    Checks weather impact for a supplier's delivery and updates compliance if adverse weather is detected.
    """

    print(f"[Weather Impact] Received: supplier_id={supplier_id}, latitude={latitude}, longitude={longitude}, delivery_date={delivery_date}")
    # Parse delivery date
    try:
        dt = int(datetime.strptime(delivery_date, "%Y-%m-%d").timestamp())
    except Exception:
        print("[Weather Impact] Invalid delivery_date format.")
        raise HTTPException(status_code=400, detail="Invalid delivery_date format. Use YYYY-MM-DD.")


    print(f"[Weather Impact] Using OW_API_KEY: {OW_API_KEY}")
    # Use 2.5 endpoint for current weather (no historical data in free tier)
    url = f"https://api.openweathermap.org/data/2.5/weather?lat={latitude}&lon={longitude}&appid={OW_API_KEY}&units=metric"
    print(f"[Weather Impact] Weather API URL: {url}")
    res = httpx.get(url).json()
    print(f"[Weather Impact] Weather API response: {res}")
    if "weather" not in res or "main" not in res:
        print("[Weather Impact] Weather data not found for the given date/location.")
        raise HTTPException(status_code=404, detail="Weather data not found for the given date/location.")
    weather_desc = res["weather"][0]["description"].lower()
    adverse = any(word in weather_desc for word in ["rain", "snow", "storm", "thunder", "hail", "extreme"])

    # Get supplier name for prompt and response
    supplier = db.query(models.Supplier).filter(models.Supplier.id == supplier_id).first()
    supplier_name = supplier.name if supplier else f"ID {supplier_id}"

    # Compose Gemini prompt
    prompt = f"""
Delivery scheduled for {delivery_date} at lat {latitude}, lon {longitude} for supplier {supplier_name}.
Weather forecast: '{weather_desc}'.
Advise if delivery may be affected and what actions to take. Format your response for a business/procurement dashboard, with a clear summary and bullet points for actions.
"""
    try:
        print(f"[Weather Impact] Gemini prompt: {prompt}")
        print(f"[Weather Impact] Gemini key in use: {GEMINI_KEY}")
        model = genai.GenerativeModel('models/gemini-1.5-flash')
        gemini_response = model.generate_content(prompt)
        recommendation = gemini_response.text.strip() if hasattr(gemini_response, 'text') else str(gemini_response)
    except Exception as e:
        print(f"[Weather Impact] Gemini error: {str(e)}")
        recommendation = f"Gemini error: {str(e)}"

    # Update compliance record if adverse weather
    compliance_update = None
    if adverse:
       
        from .. import crud
        compliance_update = crud.create_or_update_compliance_weather_delay(db, supplier_id, delivery_date)

    return {
        "adverse_weather": adverse,
        "weather": weather_desc,
        "recommendation": recommendation,
        "compliance_updated": bool(compliance_update),
        "supplier": supplier_name,
        "date": delivery_date
    }