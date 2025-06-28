from fastapi import FastAPI
from .routers import suppliers, compliance
from .database import engine, Base
from . import auth 

# Create DB tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(title="Auditryx API")

# Include routers
app.include_router(suppliers.router)
app.include_router(compliance.router)
app.include_router(auth.router) 
