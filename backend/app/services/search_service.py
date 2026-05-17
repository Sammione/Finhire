from typing import List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.domain import Candidate, Intelligence
from app.services.external_search_service import external_search_service
from app.services.ai_service import ai_service
import uuid

class SearchService:
    def __init__(self):
        self.index_name = "candidates"

    async def search_candidates(self, db: Any, query: str, filters: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """Perform real-time search with database storage and external discovery."""
        results = []
        
        # 1. Search local database first
        db_query = db.query(Candidate)
        if query and query.strip() != "":
            search_pattern = f"%{query}%"
            db_query = db_query.filter(
                or_(
                    Candidate.first_name.ilike(search_pattern),
                    Candidate.last_name.ilike(search_pattern),
                    Candidate.headline.ilike(search_pattern)
                )
            )
        
        db_candidates = db_query.all()
        for cand in db_candidates:
            results.append({
                "id": str(cand.id),
                "full_name": f"{cand.first_name} {cand.last_name}",
                "headline": cand.headline,
                "location": cand.location,
                "match_score": f"{int((cand.intelligence.overall_score if cand.intelligence else 0.5) * 100)}%",
                "source": "database"
            })

        # 2. Pull real records from the net (Multi-source: LinkedIn, Indeed, GitHub)
        if query and query.strip() != "":
            print(f"Searching net for: {query}")
            external_results = await external_search_service.search_candidates(query)
            
            for er in external_results:
                # Avoid duplicates if they are already in the DB (basic check by name)
                if not any(r["full_name"] == er["full_name"] for r in results):
                    # Use AI to score external results in real-time
                    score_data = await ai_service.calculate_candidate_score(er)
                    er["match_score"] = f"{int(score_data.get('overall_score', 0.5) * 100)}%"
                    er["source"] = "external"
                    results.append(er)
            
        return results

search_service = SearchService()
