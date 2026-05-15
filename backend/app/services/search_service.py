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
        """Perform real-time search without database storage or mock data."""
        results = []
        
        # Pull real records from the net (Multi-source: LinkedIn, Indeed, GitHub)
        if query and query.strip() != "":
            print(f"Searching net for: {query}")
            external_results = await external_search_service.search_candidates(query)
            print(f"Found {len(external_results)} external records.")
            
            for er in external_results:
                # Use AI to score external results in real-time
                score_data = await ai_service.calculate_candidate_score(er)
                er["match_score"] = f"{int(score_data.get('overall_score', 0.5) * 100)}%"
                results.append(er)
            
        return results

search_service = SearchService()
