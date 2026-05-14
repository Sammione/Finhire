from fastapi import APIRouter, Depends, HTTPException, Query
# removed session import
from app.api import deps
from app.services.search_service import search_service
from app.services.pipeline_service import intelligence_pipeline
from typing import List, Any, Optional

router = APIRouter()

@router.post("/ingest")
async def ingest_candidate(
    raw_text: str
) -> Any:
    """
    Ingest a raw professional profile text and run the AI intelligence pipeline.
    """
    try:
        candidate = await intelligence_pipeline.process_raw_profile(None, raw_text)
        return {"id": candidate["id"], "status": "processed"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/search")
async def search_candidates(
    q: Optional[str] = Query(None, description="Search query"),
    location: Optional[str] = None,
    skills: Optional[List[str]] = Query(None),
    min_score: float = 0.0
) -> Any:
    """
    Search for candidates using mock storage.
    """
    filters = {}
    if location:
        filters["location"] = location
    if skills:
        filters["skills"] = skills
        
    results = await search_service.search_candidates(q or "", filters)
    return results

@router.get("/{candidate_id}")
async def get_candidate_details(
    candidate_id: str
) -> Any:
    """
    Get detailed candidate intelligence and profile from mock storage.
    """
    candidate = search_service.candidates.get(candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return candidate

