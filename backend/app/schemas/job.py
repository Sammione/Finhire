from pydantic import BaseModel
from typing import List, Optional, Any
from datetime import datetime
from uuid import UUID

class JobBase(BaseModel):
    title: str
    company: str
    location: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[List[str]] = None
    salary_range: Optional[str] = None
    job_type: Optional[str] = None

class JobCreate(JobBase):
    pass

class JobUpdate(JobBase):
    title: Optional[str] = None
    company: Optional[str] = None
    status: Optional[str] = None

class Job(JobBase):
    id: UUID
    recruiter_id: UUID
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
