from duckduckgo_search import DDGS
import httpx
from typing import List, Dict, Any
from app.services.ai_service import ai_service
import asyncio

class ExternalSearchService:
    def __init__(self):
        self.github_api_url = "https://api.github.com/search/users"
        self.github_user_url = "https://api.github.com/users"

    async def search_candidates(self, query: str) -> List[Dict[str, Any]]:
        """Main entry point to fetch real candidates from multiple net sources."""
        # Run both searches in parallel
        github_task = self.search_github_candidates(query)
        web_task = self.search_web_candidates(query)
        
        gh_results, web_results = await asyncio.gather(github_task, web_task)
        
        # Merge results, prioritizing web results for general roles
        return web_results + gh_results

    async def search_web_candidates(self, query: str) -> List[Dict[str, Any]]:
        """Search the web for professional profiles with robust fallbacks."""
        if not query:
            return []

        candidates = []
        # Try targeted search first
        search_queries = [
            f'site:linkedin.com/in/ "{query}"',
            f'"{query}" professional profile',
            f'"{query}" resume cv'
        ]
        
        try:
            with DDGS() as ddgs:
                for sq in search_queries:
                    print(f"Executing web discovery: {sq}")
                    results = list(ddgs.text(sq, max_results=5))
                    print(f"Found {len(results)} raw web snippets.")
                    
                    if results:
                        for r in results:
                            # Skip if result seems like a job posting instead of a person
                            if "job" in r['title'].lower() or "hiring" in r['title'].lower():
                                continue

                            title_parts = r['title'].split(' - ')
                            name = title_parts[0] if title_parts else "Professional Candidate"
                            
                            candidate = {
                                "id": f"web-{hash(r['href'])}",
                                "full_name": name,
                                "headline": r['title'],
                                "location": "Remote / Global",
                                "skills": [query],
                                "summary": r['body'],
                                "experience_text": r['body'],
                                "match_score": "Analyzing..."
                            }
                            
                            # Only add if not already present
                            if not any(c['full_name'] == name for c in candidates):
                                candidates.append(candidate)
                        
                        # If we found enough candidates, stop searching other queries
                        if len(candidates) >= 3:
                            break
                            
        except Exception as e:
            print(f"CRITICAL: Web discovery failed: {e}")
            
        print(f"Total candidates discovered from web: {len(candidates)}")
        return candidates


    async def search_github_candidates(self, query: str) -> List[Dict[str, Any]]:
        """Search GitHub for real professional profiles (best for tech)."""
        if not query:
            return []

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
                    user_resp = await client.get(f"{self.github_user_url}/{item['login']}")
                    if user_resp.status_code == 200:
                        user_data = user_resp.json()
                        
                        candidate = {
                            "id": f"gh-{user_data['id']}",
                            "full_name": user_data.get("name") or user_data.get("login"),
                            "headline": user_data.get("bio") or "Professional Developer",
                            "location": user_data.get("location") or "Global",
                            "skills": ["GitHub"],
                            "summary": user_data.get("bio") or "Active contributor on GitHub.",
                            "experience_text": f"Public repositories: {user_data.get('public_repos')}.",
                            "match_score": "Calculating..."
                        }
                        
                        if user_data.get("bio"):
                            refined = await ai_service.parse_profile(user_data["bio"])
                            candidate.update({
                                "headline": refined.get("headline") or candidate["headline"],
                                "skills": refined.get("skills") or candidate["skills"]
                            })
                            
                        candidates.append(candidate)
                
                return candidates
            except Exception as e:
                print(f"GitHub search error: {e}")
                return []

external_search_service = ExternalSearchService()
