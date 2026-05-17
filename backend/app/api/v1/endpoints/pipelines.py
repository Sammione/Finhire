from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.domain import Application, ApplicationStatus, Candidate, Job
from typing import List, Any
import uuid

router = APIRouter()

@router.get("/")
async def get_pipeline_candidates(db: Session = Depends(deps.get_db)):
    """Get all candidates grouped by pipeline stage."""
    candidates = db.query(Candidate).all()
    # In a real app, this would be scoped to a specific Job's applications.
    # For MVP, we will mock the stages based on a pseudo-application or just return candidates with random stages if they lack one.
    
    pipeline = {
        "Sourced": [],
        "Screening": [],
        "Interview": [],
        "Offer": []
    }
    
    for c in candidates:
        score = f"{int((c.intelligence.overall_score if c.intelligence else 0.5) * 100)}%" if getattr(c, "intelligence", None) else "75%"
        # default to Sourced if no application
        app = db.query(Application).filter(Application.candidate_id == c.id).first()
        status = app.status.value if app else "Sourced"
        
        # Normalize status to match UI columns
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

@router.put("/{candidate_id}/stage")
async def update_pipeline_stage(
    candidate_id: str, 
    stage: str, 
    db: Session = Depends(deps.get_db)
):
    """Update a candidate's pipeline stage."""
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
        
    app = db.query(Application).filter(Application.candidate_id == candidate.id).first()
    
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
        # Create a mock application to store the status
        job = db.query(Job).first()
        app = Application(
            candidate_id=candidate.id,
            job_id=job.id if job else None,
            status=new_status
        )
        db.add(app)
        
    db.commit()
    return {"status": "success", "new_stage": stage}
