from sqlalchemy import Column, String, Boolean, ForeignKey, Enum, JSON, Float, DateTime, Text, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from app.models.base import Base
import enum

class JobStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    PAUSED = "PAUSED"
    CLOSED = "CLOSED"

class ApplicationStatus(str, enum.Enum):
    APPLIED = "APPLIED"
    SCREENING = "SCREENING"
    INTERVIEW = "INTERVIEW"
    OFFER = "OFFER"
    REJECTED = "REJECTED"
    HIRED = "HIRED"

class UserRole(str, enum.Enum):
    RECRUITER = "RECRUITER"
    ADMIN = "ADMIN"

class User(Base):
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    role = Column(Enum(UserRole), default=UserRole.RECRUITER)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Candidate(Base):
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    first_name = Column(String)
    last_name = Column(String)
    email = Column(String, unique=True, index=True)
    phone = Column(String)
    headline = Column(String)
    location = Column(String)
    summary = Column(Text)
    raw_data = Column(JSON) # Original profile data
    
    experience = relationship("Experience", back_populates="candidate")
    intelligence = relationship("Intelligence", back_populates="candidate", uselist=False)
    applications = relationship("Application", back_populates="candidate")

class Experience(Base):
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    candidate_id = Column(UUID(as_uuid=True), ForeignKey("candidate.id"))
    title = Column(String)
    company = Column(String)
    start_date = Column(DateTime)
    end_date = Column(DateTime, nullable=True)
    description = Column(String)
    is_fintech = Column(Boolean, default=False)
    
    candidate = relationship("Candidate", back_populates="experience")

class Intelligence(Base):
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    candidate_id = Column(UUID(as_uuid=True), ForeignKey("candidate.id"))
    overall_score = Column(Float)
    stability_score = Column(Float)
    relevance_score = Column(Float)
    ai_summary = Column(Text)
    skills = Column(JSON)
    risk_indicators = Column(JSON)
    embedding = Column(JSON) # Store vector as list for now, or use pgvector
    
    candidate = relationship("Candidate", back_populates="intelligence")

class Job(Base):
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    recruiter_id = Column(UUID(as_uuid=True), ForeignKey("user.id"))
    title = Column(String, nullable=False)
    company = Column(String, nullable=False)
    location = Column(String)
    description = Column(Text)
    requirements = Column(JSON) # List of requirements
    salary_range = Column(String)
    job_type = Column(String) # e.g., "Full-time", "Contract"
    status = Column(Enum(JobStatus), default=JobStatus.ACTIVE)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    recruiter = relationship("User")
    applications = relationship("Application", back_populates="job")

class Application(Base):
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    job_id = Column(UUID(as_uuid=True), ForeignKey("job.id"))
    candidate_id = Column(UUID(as_uuid=True), ForeignKey("candidate.id"))
    status = Column(Enum(ApplicationStatus), default=ApplicationStatus.APPLIED)
    applied_at = Column(DateTime, default=datetime.utcnow)
    resume_url = Column(String) # Link to stored resume if any
    notes = Column(Text)
    
    job = relationship("Job", back_populates="applications")
    candidate = relationship("Candidate", back_populates="applications")

class Settings(Base):
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    # Using String for simplicity in MVP instead of enforcing foreign key if user not strictly managed
    user_id = Column(String, unique=True, nullable=True) 
    company_name = Column(String, default="FinHire IQ Global")
    industry = Column(String, default="Financial Services")
    stability_weight = Column(Float, default=80)
    fintech_weight = Column(Float, default=95)
    skill_match_weight = Column(Float, default=60)
    ethical_bias_mitigation = Column(Boolean, default=True)
    auto_refresh = Column(Boolean, default=True)

class Campaign(Base):
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String)
    status = Column(String, default="Active")
    emails_sent = Column(Integer, default=0)
    open_rate = Column(Float, default=0.0)
    reply_rate = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

