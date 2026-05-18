from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.api import deps
from app.models.domain import Job, Application, Candidate, JobStatus, ApplicationStatus
from app.schemas.job import JobCreate, Job as JobSchema
from app.schemas.application import ApplicationCreate
from app.services.pipeline_service import intelligence_pipeline
from typing import List, Any, Optional
import uuid

router = APIRouter()

@router.get("/", response_model=List[JobSchema])
async def list_jobs(
    db: Session = Depends(deps.get_db)
) -> Any:
    """
    List all active jobs. (In a real app, filter by current recruiter)
    """
    return db.query(Job).filter(Job.status == JobStatus.ACTIVE).all()

@router.post("/", response_model=JobSchema)
async def create_job(
    job_in: JobCreate,
    db: Session = Depends(deps.get_db)
) -> Any:
    """
    Create a new job vacancy.
    """
    from app.models.domain import User
    
    # Get or create a default user for MVP
    user = db.query(User).first()
    if not user:
        user = User(email="demo@finhireiq.com", hashed_password="fake", full_name="Demo Recruiter")
        db.add(user)
        db.commit()
        db.refresh(user)

    job = Job(
        **job_in.dict(),
        recruiter_id=user.id,
        status=JobStatus.ACTIVE
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return job

@router.delete("/{job_id}")
async def delete_job(
    job_id: str,
    db: Session = Depends(deps.get_db)
) -> Any:
    """
    Delete a job vacancy.
    """
    try:
        uuid_obj = uuid.UUID(job_id)
        job = db.query(Job).filter(Job.id == uuid_obj).first()
    except ValueError:
        job = db.query(Job).filter(Job.id == job_id).first()

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    db.delete(job)
    db.commit()
    return {"status": "success", "message": "Job deleted successfully"}

@router.get("/{job_id}", response_model=JobSchema)
async def get_job_public(
    job_id: str,
    db: Session = Depends(deps.get_db)
) -> Any:
    """
    Publicly get job details for the application landing page.
    """
    # SQLite with UUID(as_uuid=True) requires explicit uuid.UUID objects
    try:
        uuid_obj = uuid.UUID(job_id)
        job = db.query(Job).filter(Job.id == uuid_obj).first()
    except ValueError:
        # Try finding by string if it's a compact UUID or something else
        job = db.query(Job).filter(Job.id == job_id).first()

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@router.post("/{job_id}/apply")
async def apply_for_job(
    job_id: str,
    application_in: ApplicationCreate,
    db: Session = Depends(deps.get_db)
) -> Any:
    """
    Publicly apply for a job. This creates a candidate and runs AI analysis.
    """
    try:
        uuid_obj = uuid.UUID(job_id)
        job = db.query(Job).filter(Job.id == uuid_obj).first()
    except ValueError:
        job = db.query(Job).filter(Job.id == job_id).first()

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # 1. Create or get candidate
    candidate = db.query(Candidate).filter(Candidate.email == application_in.email).first()
    if not candidate:
        candidate = Candidate(
            first_name=application_in.first_name,
            last_name=application_in.last_name,
            email=application_in.email,
            phone=application_in.phone,
            raw_data={"source": f"application_job_{job_id}"}
        )
        db.add(candidate)
        db.flush() # Get candidate.id

    # 2. Run Intelligence Pipeline on the resume text
    try:
        await intelligence_pipeline.process_raw_profile(db, application_in.resume_text, candidate_id=candidate.id)
    except Exception as e:
        print(f"Intelligence pipeline failed: {e}")
        # We still want to save the application even if AI fails

    # 3. Create Application record
    application = Application(
        job_id=job.id,
        candidate_id=candidate.id,
        status=ApplicationStatus.APPLIED,
        notes=application_in.notes
    )
    db.add(application)
    db.commit()
    
    return {"status": "success", "message": "Application submitted successfully", "application_id": str(application.id)}

from fastapi import UploadFile, File
from app.services.ai_service import ai_service
import io

@router.post("/parse-resume")
async def parse_resume(file: UploadFile = File(...)):
    """
    Extracts text from an uploaded CV (PDF or TXT) and uses the AI service to parse it into structured JSON.
    """
    try:
        content = await file.read()
        text = ""
        if file.filename.lower().endswith(".pdf"):
            import PyPDF2
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(content))
            for page in pdf_reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
        else:
            # Assume plain text
            text = content.decode("utf-8", errors="ignore")
            
        if not text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from the provided file.")
            
        # Parse text into structured data
        parsed_data = await ai_service.parse_profile(text)
        return {"status": "success", "data": parsed_data, "raw_text": text}
    except Exception as e:
        print(f"Error parsing resume: {e}")
        raise HTTPException(status_code=500, detail="Failed to parse the resume file.")
