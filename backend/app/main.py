from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.api import api_router
app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

from app.models import domain
from app.models.base import Base
from app.db.session import engine

# Create DB tables
Base.metadata.create_all(bind=engine)



# Set all CORS enabled origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {"message": "Welcome to FinHireIQ API", "version": "1.0.0"}

from sqlalchemy import text
from sqlalchemy.orm import Session
from fastapi import Depends
from app.api.deps import get_db

@app.get("/health")
async def health_check(db: Session = Depends(get_db)):
    """
    Health check endpoint. 
    Queries the database to keep it awake on free tiers (like Supabase).
    """
    try:
        # Simple query to ensure the DB connection is active
        db.execute(text("SELECT 1"))
        return {"status": "ok", "database": "connected"}
    except Exception as e:
        return {"status": "error", "database": "disconnected", "details": str(e)}

@app.get("/clear-database-wipe")
async def clear_database():
    """
    Temporary debug endpoint to wipe and recreate all database tables.
    """
    try:
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)
        return {"status": "success", "message": "Database wiped and recreated successfully!"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

