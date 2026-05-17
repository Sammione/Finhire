import os
import httpx
from typing import List, Dict, Any
from app.services.ai_service import ai_service
import asyncio

class ExternalSearchService:
    def __init__(self):
        self.github_api_url = "https://api.github.com/search/users"
        self.github_user_url = "https://api.github.com/users"
        self.serpapi_key = os.getenv("SERPAPI_API_KEY", "")
        self.apify_token = os.getenv("APIFY_API_TOKEN", "")

    async def search_candidates(self, query: str) -> List[Dict[str, Any]]:
        """Main entry point to fetch real candidates from multiple net sources."""
        # Run both searches in parallel
        github_task = self.search_github_candidates(query)
        web_task = self.search_web_candidates(query)
        
        gh_results, web_results = await asyncio.gather(github_task, web_task)
        
        # Merge results, prioritizing web results for general roles
        return web_results + gh_results

    async def search_web_candidates(self, query: str) -> List[Dict[str, Any]]:
        """Search the web for professional profiles using SerpApi (Instant Search)."""
        if not query:
            return []

        candidates = []
        search_query = f'site:linkedin.com/in/ OR site:indeed.com/r/ "{query}"'
        
        if not self.serpapi_key:
            print("WARNING: SERPAPI_API_KEY is not set. Falling back to empty web results.")
            return candidates

        async with httpx.AsyncClient() as client:
            try:
                print(f"Executing SerpApi web discovery: {search_query}")
                response = await client.get(
                    "https://serpapi.com/search.json",
                    params={
                        "engine": "google",
                        "q": search_query,
                        "api_key": self.serpapi_key,
                        "num": 10  # Get top 10 instantly
                    },
                    timeout=10.0
                )
                response.raise_for_status()
                data = response.json()
                results = data.get("organic_results", [])
                
                print(f"Found {len(results)} raw web snippets from SerpApi.")
                
                for r in results:
                    title = r.get("title", "")
                    link = r.get("link", "")
                    snippet = r.get("snippet", "")
                    
                    if "job" in title.lower() or "hiring" in title.lower() or "/jobs/" in link:
                        continue

                    title_parts = title.split(' - ')
                    name = title_parts[0] if title_parts else "Professional Candidate"
                    
                    candidate = {
                        "id": f"web-{hash(link)}",
                        "full_name": name,
                        "headline": title,
                        "location": "Remote / Global",
                        "skills": [query],
                        "summary": snippet,
                        "experience_text": snippet,
                        "match_score": "Analyzing..."
                    }
                    
                    if not any(c['full_name'] == name for c in candidates):
                        candidates.append(candidate)

            except Exception as e:
                print(f"CRITICAL: SerpApi web discovery failed: {e}")
                
        print(f"Total candidates discovered from web: {len(candidates)}")
        return candidates

    async def deep_source_candidates(self, query: str) -> Dict[str, Any]:
        """Trigger Apify Background Task for Deep Sourcing (Hundreds of resumes)."""
        if not self.apify_token:
            return {"status": "error", "message": "APIFY_API_TOKEN is not set."}
        
        # This calls a specific Apify actor (e.g., an Indeed Scraper) in the background
        async with httpx.AsyncClient() as client:
            try:
                print(f"Triggering Apify Deep Source for: {query}")
                # We use a placeholder Indeed scraper Actor ID here
                actor_id = "hynek~indeed-scraper"
                response = await client.post(
                    f"https://api.apify.com/v2/acts/{actor_id}/runs?token={self.apify_token}",
                    json={
                        "searchTerms": [query],
                        "maxItems": 500
                    },
                    timeout=10.0
                )
                response.raise_for_status()
                data = response.json()
                run_id = data.get("data", {}).get("id")
                
                return {
                    "status": "success", 
                    "message": "Deep sourcing started in the background.",
                    "run_id": run_id
                }
            except Exception as e:
                print(f"Apify Deep Source failed: {e}")
                return {"status": "error", "message": str(e)}


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
