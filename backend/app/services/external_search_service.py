import httpx
from typing import List, Dict, Any
from app.services.ai_service import ai_service

class ExternalSearchService:
    def __init__(self):
        self.github_api_url = "https://api.github.com/search/users"
        self.github_user_url = "https://api.github.com/users"

    async def search_github_candidates(self, query: str) -> List[Dict[str, Any]]:
        """Search GitHub for real professional profiles."""
        if not query:
            return []

        # Enhance query for professional search on GitHub
        # We look for people with "finance" or the query in their bio/location
        search_query = f"{query} type:user"
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    self.github_api_url,
                    params={"q": search_query, "per_page": 5},
                    timeout=10.0
                )
                response.raise_for_status()
                items = response.json().get("items", [])
                
                candidates = []
                for item in items:
                    # Fetch detailed profile
                    user_resp = await client.get(f"{self.github_user_url}/{item['login']}")
                    if user_resp.status_code == 200:
                        user_data = user_resp.json()
                        
                        # Convert GitHub profile to Candidate format
                        candidate = {
                            "id": f"gh-{user_data['id']}",
                            "full_name": user_data.get("name") or user_data.get("login"),
                            "headline": user_data.get("bio") or "Professional Developer",
                            "location": user_data.get("location") or "Global",
                            "skills": ["GitHub", "Open Source"], # Placeholder or extracted later
                            "summary": user_data.get("bio") or "Active contributor on GitHub.",
                            "experience_text": f"Public repositories: {user_data.get('public_repos')}. Followers: {user_data.get('followers')}.",
                            "match_score": "Calculating..." # Will be updated by AI if needed
                        }
                        
                        # Use AI to refine the data if bio is available
                        if user_data.get("bio"):
                            refined = await ai_service.parse_profile(user_data["bio"])
                            candidate.update({
                                "headline": refined.get("headline") or candidate["headline"],
                                "skills": refined.get("skills") or candidate["skills"]
                            })
                            
                        candidates.append(candidate)
                
                return candidates
            except Exception as e:
                print(f"External search error: {e}")
                return []

external_search_service = ExternalSearchService()
