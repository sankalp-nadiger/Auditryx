from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from passlib.context import CryptContext
from jose import JWTError, jwt
from . import models, schemas, database

# JWT Config
SECRET_KEY = "THIS_IS_A_SECRET"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# Auth dependencies
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
router = APIRouter(prefix="/auth", tags=["auth"])

# ---------- Password hashing utils ----------

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def hash_password(password):
    return pwd_context.hash(password)

# ---------- JWT utils ----------

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_access_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None


# ---------- Auth routes ----------

@router.post("/token")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token_data = {"sub": str(user.id)}
    access_token = create_access_token(token_data, timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name
        }
    }


# ---------- Signup route ----------
from fastapi import Body

@router.post("/signup", status_code=201)
def signup(
    email: str = Body(...),
    password: str = Body(...),
    full_name: str = Body(None),
    db: Session = Depends(database.get_db)
):
    # Check if user already exists
    existing_user = db.query(models.User).filter(models.User.email == email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    # Create new user
    hashed_password = hash_password(password)
    new_user = models.User(email=email, hashed_password=hashed_password, full_name=full_name)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    # Return token on signup
    token_data = {"sub": str(new_user.id)}
    access_token = create_access_token(token_data, timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": new_user.id,
            "email": new_user.email,
            "full_name": new_user.full_name
        }
    }

# ---------- Protected route dependency ----------

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    user_id = payload.get("sub")
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/dashboard-data")
def get_dashboard_data(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    user_id = int(payload.get("sub"))
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Supplier and compliance stats for this user
    suppliers = db.query(models.Supplier).filter(models.Supplier.user_id == user_id).all()
    supplier_count = len(suppliers)
    compliance_count = db.query(models.ComplianceRecord).join(models.Supplier).filter(models.Supplier.user_id == user_id).count()
    recent_suppliers = [
        {"name": s.name, "country": s.country, "last_audit": str(s.last_audit) if s.last_audit else None}
        for s in suppliers[-5:]
    ]
    recent_compliance = db.query(models.ComplianceRecord).join(models.Supplier).filter(models.Supplier.user_id == user_id).order_by(models.ComplianceRecord.date_recorded.desc()).limit(5).all()
    recent_compliance_list = [
        {
            "supplier": db.query(models.Supplier).filter(models.Supplier.id == c.supplier_id).first().name,
            "metric": c.metric,
            "date_recorded": str(c.date_recorded),
            "result": c.result,
            "status": c.status
        }
        for c in recent_compliance
    ]
    return {
        "suppliers": supplier_count,
        "compliance_records": compliance_count,
        "recent_suppliers": recent_suppliers,
        "recent_compliance": recent_compliance_list
    }