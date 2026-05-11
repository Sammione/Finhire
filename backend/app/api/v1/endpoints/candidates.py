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
        return {"id": str(candidate.id), "status": "processed"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/search")
async def search_candidates(
    q: str = Query(..., description="Search query"),
    location: Optional[str] = None,
    skills: Optional[List[str]] = Query(None),
    min_score: float = 0.0
) -> Any:
    """
    Search for candidates using semantic and keyword matching.
    """
    filters = {}
    if location:
        filters["location"] = location
    if skills:
        filters["skills"] = skills
        
    results = await search_service.search_candidates(q, filters)
    return results

@router.get("/{candidate_id}")
async def get_candidate_details(
    candidate_id: str,
    db: Session = Depends(deps.get_db)
) -> Any:
    """
    Get detailed candidate intelligence and profile.
    """
    # Logic to fetch from DB and include intelligence scores
    return {"message": "Endpoint in development"}
