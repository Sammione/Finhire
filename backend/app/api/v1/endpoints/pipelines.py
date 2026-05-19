from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.domain import Application, ApplicationStatus, Candidate, Job
from typing import List, Any
import uuid

router = APIRouter()

from typing import List, Any, Optional

@router.get("/")
async def get_pipeline_candidates(
    job_id: Optional[str] = None,
    db: Session = Depends(deps.get_db)
):
    """Get all candidates grouped by pipeline stage, optionally scoped by job_id."""
    pipeline = {
        "Sourced": [],
        "Screening": [],
        "Interview": [],
        "Offer": []
    }
    
    # 1. Fetch relevant applications
    app_query = db.query(Application)
    
    if job_id and job_id.strip() != "":
        try:
            uuid_job_id = uuid.UUID(job_id)
            app_query = app_query.filter(Application.job_id == uuid_job_id)
        except ValueError:
            app_query = app_query.filter(Application.job_id == job_id)
            
    applications = app_query.all()
    
    # Backward compatibility: if no job_id or no applications found, return all candidates
    if (not job_id or job_id.strip() == "") and not applications:
        candidates = db.query(Candidate).all()
        for c in candidates:
            score = f"{int((c.intelligence.overall_score if c.intelligence else 0.5) * 100)}%" if getattr(c, "intelligence", None) else "75%"
            app = db.query(Application).filter(Application.candidate_id == c.id).first()
            status = app.status.value if app else "Sourced"
            if status == "APPLIED": status = "Sourced"
            
            item = {
                "id": str(c.id),
                "full_name": f"{c.first_name} {c.last_name}",
                "match_score": score,
                "time": "Just now",
                "status": status
            }
            if status in pipeline:
                pipeline[status].append(item)
            else:
                pipeline["Sourced"].append(item)
        return pipeline
        
    for app in applications:
        c = app.candidate
        if not c:
            continue
            
        score = f"{int((c.intelligence.overall_score if c.intelligence else 0.5) * 100)}%" if getattr(c, "intelligence", None) else "75%"
        status = app.status.value if app.status else "Sourced"
        
        # Normalize status to match UI columns
        if status == "APPLIED": status = "Sourced"
        
        item = {
            "id": str(c.id),
            "full_name": f"{c.first_name} {c.last_name}",
            "match_score": score,
            "time": "Just now" if not app.applied_at else app.applied_at.strftime("%Y-%m-%d"),
            "status": status
        }
        
        if status in pipeline:
            pipeline[status].append(item)
        else:
            pipeline["Sourced"].append(item)
            
    return pipeline

@router.put("/{candidate_id}/stage")
async def update_pipeline_stage(
    candidate_id: str, 
    stage: str, 
    job_id: Optional[str] = None,
    db: Session = Depends(deps.get_db)
):
    """Update a candidate's pipeline stage for a specific job."""
    try:
        uuid_cand_id = uuid.UUID(candidate_id)
        candidate = db.query(Candidate).filter(Candidate.id == uuid_cand_id).first()
    except ValueError:
        candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
        
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
        
    # Find the specific application
    app_query = db.query(Application).filter(Application.candidate_id == candidate.id)
    if job_id and job_id.strip() != "":
        try:
            uuid_job_id = uuid.UUID(job_id)
            app_query = app_query.filter(Application.job_id == uuid_job_id)
        except ValueError:
            app_query = app_query.filter(Application.job_id == job_id)
            
    app = app_query.first()
    
    # Map frontend columns to ApplicationStatus
    stage_map = {
        "Sourced": ApplicationStatus.APPLIED,
        "Screening": ApplicationStatus.SCREENING,
        "Interview": ApplicationStatus.INTERVIEW,
        "Offer": ApplicationStatus.OFFER
    }
    
    new_status = stage_map.get(stage, ApplicationStatus.APPLIED)
    
    if app:
        app.status = new_status
    else:
        # Create a new application
        resolved_job_id = None
        if job_id and job_id.strip() != "":
            try:
                resolved_job_id = uuid.UUID(job_id)
            except ValueError:
                resolved_job_id = job_id
        else:
            first_job = db.query(Job).first()
            resolved_job_id = first_job.id if first_job else None
            
        app = Application(
            candidate_id=candidate.id,
            job_id=resolved_job_id,
            status=new_status
        )
        db.add(app)
        
    db.commit()
    return {"status": "success", "new_stage": stage}
