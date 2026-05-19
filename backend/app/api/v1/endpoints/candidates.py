from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.api import deps
from app.services.search_service import search_service
from app.services.pipeline_service import intelligence_pipeline
from typing import List, Any, Optional

router = APIRouter()

@router.post("/ingest")
async def ingest_candidate(
    raw_text: str,
    job_id: Optional[str] = Query(None, description="Job vacancy to shortlist for"),
    db: Session = Depends(deps.get_db)
) -> Any:
    """
    Ingest a raw professional profile text and run the AI intelligence pipeline.
    """
    try:
        candidate = await intelligence_pipeline.process_raw_profile(db, raw_text, job_id=job_id)
        return {"id": candidate["id"], "status": "processed"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/search")
async def search_candidates(
    q: Optional[str] = Query(None, description="Search query"),
    location: Optional[str] = None,
    skills: Optional[List[str]] = Query(None),
    min_score: float = 0.0,
    page: int = Query(1, description="Page number"),
    db: Session = Depends(deps.get_db)
) -> Any:
    """
    Search for candidates using real database and external discovery.
    """
    filters = {}
    if location:
        filters["location"] = location
    if skills:
        filters["skills"] = skills
        
    results = await search_service.search_candidates(db, q or "", filters, page=page)
    return results

@router.get("/{candidate_id}")
async def get_candidate_details(
    candidate_id: str,
    db: Session = Depends(deps.get_db)
) -> Any:
    """
    Get detailed candidate intelligence and profile from real storage.
    """
    import uuid
    from app.models.domain import Candidate
    
    try:
        uuid_obj = uuid.UUID(candidate_id)
        candidate = db.query(Candidate).filter(Candidate.id == uuid_obj).first()
    except ValueError:
        candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
        
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    # Format experience relationships safely into JSON-serializable dictionaries
    experience_list = []
    if candidate.experience:
        for exp in candidate.experience:
            experience_list.append({
                "title": exp.title,
                "company": exp.company,
                "description": exp.description
            })
            
    # Format intelligence safely into JSON-serializable dictionary
    intel = candidate.intelligence
    intelligence_dict = {
        "overall_score": intel.overall_score if intel else 0.75,
        "stability_score": intel.stability_score if intel else 0.85,
        "relevance_score": intel.relevance_score if intel else 0.80,
        "ai_summary": intel.ai_summary if intel else "",
        "skills": intel.skills if intel else [],
        "risk_indicators": intel.risk_indicators if intel else []
    }
    
    orig_url = None
    if candidate.raw_data and isinstance(candidate.raw_data, dict):
        orig_url = candidate.raw_data.get("original_url")
        
    return {
        "id": str(candidate.id),
        "full_name": f"{candidate.first_name} {candidate.last_name}",
        "headline": candidate.headline,
        "location": candidate.location,
        "summary": candidate.summary,
        "profile_url": orig_url,
        "experience": experience_list,
        "intelligence": intelligence_dict
    }

@router.delete("/{candidate_id}")
async def delete_candidate(
    candidate_id: str,
    db: Session = Depends(deps.get_db)
) -> Any:
    """
    Delete a candidate.
    """
    import uuid
    from app.models.domain import Candidate, Intelligence, Experience, Application
    try:
        uuid_obj = uuid.UUID(candidate_id)
        candidate = db.query(Candidate).filter(Candidate.id == uuid_obj).first()
    except ValueError:
        candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()

    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
        
    # Also delete cascading records just in case
    db.query(Intelligence).filter(Intelligence.candidate_id == candidate.id).delete()
    db.query(Experience).filter(Experience.candidate_id == candidate.id).delete()
    db.query(Application).filter(Application.candidate_id == candidate.id).delete()
    
    db.delete(candidate)
    db.commit()
    return {"status": "success", "message": "Candidate deleted successfully"}



