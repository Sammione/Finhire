from typing import List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.domain import Candidate, Intelligence
from app.services.external_search_service import external_search_service
from app.services.ai_service import ai_service
import uuid

def parse_query_and_location(query: str, location_filter: str = None):
    """
    Extracts explicit query and location from a search string and combines with explicit location filter.
    Returns (clean_query, resolved_location)
    """
    clean_query = query.strip() if query else ""
    resolved_location = location_filter.strip() if location_filter else ""
    
    # If location is not already specified, try to parse it from the query
    if not resolved_location and clean_query:
        # 1. First check explicit separators
        found_separator = False
        for separator in [" in ", " at ", " near ", ", "]:
            if separator in clean_query.lower():
                idx = clean_query.lower().find(separator)
                role_part = clean_query[:idx].strip()
                loc_part = clean_query[idx + len(separator):].strip()
                if role_part and loc_part:
                    clean_query = role_part
                    resolved_location = loc_part
                    found_separator = True
                    break
        
        # 2. If no explicit separator, check for common locations in the query text
        if not found_separator:
            for city in ["lagos", "abuja", "ibadan", "port harcourt", "kano", "new york", "london", "san francisco"]:
                if city in clean_query.lower():
                    resolved_location = city
                    idx = clean_query.lower().find(city)
                    preceding = clean_query[:idx].rstrip()
                    # Also remove joining words like "in", "at", etc.
                    for joiner in [" in", " at", " near"]:
                        if preceding.lower().endswith(joiner):
                            preceding = preceding[:-len(joiner)].rstrip()
                    post = clean_query[idx + len(city):].lstrip()
                    clean_query = f"{preceding} {post}".strip()
                    break
                    
    return clean_query, resolved_location

class SearchService:
    def __init__(self):
        self.index_name = "candidates"

    async def search_candidates(self, db: Any, query: str, filters: Dict[str, Any] = None, page: int = 1) -> List[Dict[str, Any]]:
        """Perform real-time search with database storage and external discovery."""
        results = []
        
        location_filter = filters.get("location") if filters else None
        clean_query, resolved_location = parse_query_and_location(query, location_filter)
        
        # 1. Search local database first
        db_query = db.query(Candidate)
        if clean_query and clean_query.strip() != "":
            search_pattern = f"%{clean_query}%"
            db_query = db_query.filter(
                or_(
                    Candidate.first_name.ilike(search_pattern),
                    Candidate.last_name.ilike(search_pattern),
                    Candidate.headline.ilike(search_pattern),
                    Candidate.summary.ilike(search_pattern)
                )
            )
            
        if resolved_location and resolved_location.strip() != "":
            loc_pattern = f"%{resolved_location}%"
            db_query = db_query.filter(Candidate.location.ilike(loc_pattern))
        
        db_candidates = db_query.all()
        for cand in db_candidates:
            results.append({
                "id": str(cand.id),
                "full_name": f"{cand.first_name} {cand.last_name}",
                "headline": cand.headline,
                "location": cand.location,
                "match_score": f"{int((cand.intelligence.overall_score if cand.intelligence else 0.5) * 100)}%",
                "source": "database",
                "summary": cand.summary,
                "skills": cand.intelligence.skills if cand.intelligence else []
            })

        # 2. Pull real records from the net (Multi-source: LinkedIn, Indeed, GitHub)
        if clean_query and clean_query.strip() != "":
            print(f"Searching net for: {clean_query} (location: {resolved_location}) (page: {page})")
            external_results = await external_search_service.search_candidates(clean_query, resolved_location, page=page)
            
            for er in external_results:
                # Post-filter external results by location to ensure high relevance
                if resolved_location:
                    cand_loc = er.get("location", "").lower()
                    # If location of external candidate does not contain resolved_location, skip it
                    if resolved_location.lower() not in cand_loc and cand_loc != "remote" and cand_loc != "remote / global":
                        continue
                        
                # Avoid duplicates if they are already in the DB (basic check by name)
                if not any(r["full_name"] == er["full_name"] for r in results):
                    # Use AI to score external results in real-time
                    score_data = await ai_service.calculate_candidate_score(er)
                    er["match_score"] = f"{int(score_data.get('overall_score', 0.5) * 100)}%"
                    er["source"] = "external"
                    results.append(er)
            
        return results

search_service = SearchService()
