from pydantic import BaseModel, EmailStr
from typing import List, Optional, Any
from datetime import datetime
from uuid import UUID

class ApplicationCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: Optional[str] = None
    resume_text: str  # We'll use this to create/update candidate profile
    notes: Optional[str] = None

class Application(BaseModel):
    id: UUID
    job_id: UUID
    candidate_id: UUID
    status: str
    applied_at: datetime
    resume_url: Optional[str] = None
    notes: Optional[str] = None

    class Config:
        from_attributes = True
