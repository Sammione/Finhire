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
    db: Session = Depends(deps.get_db)
) -> Any:
    """
    Ingest a raw professional profile text and run the AI intelligence pipeline.
    """
    try:
        candidate = await intelligence_pipeline.process_raw_profile(db, raw_text)
        return {"id": candidate["id"], "status": "processed"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/search")
async def search_candidates(
    q: Optional[str] = Query(None, description="Search query"),
    location: Optional[str] = None,
    skills: Optional[List[str]] = Query(None),
    min_score: float = 0.0,
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
        
    results = await search_service.search_candidates(db, q or "", filters)
    return results

@router.get("/{candidate_id}")
async def get_candidate_details(
    candidate_id: str,
    db: Session = Depends(deps.get_db)
) -> Any:
    """
    Get detailed candidate intelligence and profile from real storage.
    """
    # Import model here to avoid circular imports if any
    from app.models.domain import Candidate
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    # Format response
    return {
        "id": str(candidate.id),
        "full_name": f"{candidate.first_name} {candidate.last_name}",
        "headline": candidate.headline,
        "location": candidate.location,
        "summary": candidate.summary,
        "experience": candidate.experience,
        "intelligence": candidate.intelligence
    }


