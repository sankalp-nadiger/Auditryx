from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import suppliers, compliance, weather
from .database import engine, Base
from . import auth

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Auditryx API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(suppliers.router)
app.include_router(compliance.router)
app.include_router(weather.router)
app.include_router(auth.router)
