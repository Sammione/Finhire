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
        self.rapidapi_key = os.getenv("RAPIDAPI_KEY", "")

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
                        "num": 20  # Get top 20 instantly
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

    async def enrich_linkedin_profiles(self, urls: List[str]) -> List[Dict[str, Any]]:
        """Use RapidAPI (Real-Time LinkedIn Scraper API) to extract full profiles."""
        if not self.rapidapi_key:
            print("ERROR: RAPIDAPI_KEY is not set.")
            return []
            
        if not urls:
            return []
            
        enriched = []
        async with httpx.AsyncClient() as client:
            for url in urls:
                try:
                    print(f"Triggering RapidAPI LinkedIn Scraper for: {url}")
                    
                    response = await client.get(
                        "https://linkedin-data-api.p.rapidapi.com/get-profile-data-by-url",
                        headers={
                            "x-rapidapi-key": self.rapidapi_key,
                            "x-rapidapi-host": "linkedin-data-api.p.rapidapi.com"
                        },
                        params={
                            "linkedin_url": url
                        },
                        timeout=30.0
                    )
                    
                    if response.status_code == 200:
                        data = response.json()
                        if data.get("success"):
                            enriched.append(data.get("data", {}))
                            print(f"✅ RapidAPI Enrichment Success for {url}")
                        else:
                            print(f"❌ RapidAPI Failed for {url}: {data.get('message')}")
                    else:
                        print(f"❌ RapidAPI HTTP Error {response.status_code} for {url}")
                        
                except Exception as e:
                    print(f"❌ RapidAPI Enrichment Exception for {url}: {e}")
                    
        return enriched

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
