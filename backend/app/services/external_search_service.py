import os
import httpx
from typing import List, Dict, Any
from app.services.ai_service import ai_service
import asyncio

def extract_location_from_text(title: str, snippet: str, default_location: str = "Remote / Global") -> str:
    """
    Scans the snippet and title for explicit cities and regions to accurately determine
    the candidate's actual location. Prevents mislabeling.
    """
    title_lower = title.lower()
    snippet_lower = snippet.lower()
    
    # Map common cities to their full, neat representation
    cities = {
        "lagos": "Lagos, Nigeria",
        "abuja": "Abuja, Nigeria",
        "ibadan": "Ibadan, Nigeria",
        "port harcourt": "Port Harcourt, Nigeria",
        "kano": "Kano, Nigeria",
        "kaduna": "Kaduna, Nigeria",
        "enugu": "Enugu, Nigeria",
        "benin city": "Benin City, Nigeria",
        "new york": "New York, USA",
        "san francisco": "San Francisco, USA",
        "london": "London, UK",
        "toronto": "Toronto, Canada",
        "dublin": "Dublin, Ireland",
        "berlin": "Berlin, Germany",
        "paris": "Paris, France",
        "sydney": "Sydney, Australia",
        "seattle": "Seattle, USA",
        "chicago": "Chicago, USA",
        "austin": "Austin, USA",
        "boston": "Boston, USA",
        "los angeles": "Los Angeles, USA"
    }
    
    # Try exact city matching first
    for city_key, full_name in cities.items():
        if city_key in title_lower or city_key in snippet_lower:
            return full_name
            
    # Fallback to check countries/regions if no specific city matches
    if "nigeria" in title_lower or "nigeria" in snippet_lower:
        return "Nigeria"
    if "united kingdom" in title_lower or " uk " in f" {title_lower} " or "united kingdom" in snippet_lower or " uk " in f" {snippet_lower} ":
        return "United Kingdom"
    if "united states" in title_lower or " usa " in f" {title_lower} " or "us " in title_lower or "united states" in snippet_lower or " usa " in f" {snippet_lower} " or " us " in f" {snippet_lower} ":
        return "United States"
    if "canada" in title_lower or "canada" in snippet_lower:
        return "Canada"
        
    return default_location

class ExternalSearchService:
    def __init__(self):
        self.github_api_url = "https://api.github.com/search/users"
        self.github_user_url = "https://api.github.com/users"
        self.serpapi_key = os.getenv("SERPAPI_API_KEY", "")
        self.rapidapi_key = os.getenv("RAPIDAPI_KEY", "")

    async def search_candidates(self, query: str, location: str = "", page: int = 1) -> List[Dict[str, Any]]:
        """Main entry point to fetch real candidates from multiple net sources."""
        # Run both searches in parallel
        github_task = self.search_github_candidates(query, location, page=page)
        web_task = self.search_web_candidates(query, location, page=page)
        
        gh_results, web_results = await asyncio.gather(github_task, web_task)
        
        # Merge results, prioritizing web results for general roles
        return web_results + gh_results

    async def search_web_candidates(self, query: str, location: str = "", page: int = 1) -> List[Dict[str, Any]]:
        """Search the web for professional profiles using SerpApi (Instant Search)."""
        if not query:
            return []

        candidates = []
        
        # Build structured Google query terms
        terms = []
        
        # 1. Add keywords / role
        clean_query = query.replace('"', '').strip()
        
        # 2. Add location (explicit or implicit)
        clean_location = location.replace('"', '').strip() if location else ""
        
        if not clean_location:
            # Detect common locations inside query
            for city in ["lagos", "abuja", "ibadan", "port harcourt", "kano", "new york", "london", "san francisco"]:
                if city in clean_query.lower():
                    clean_location = city
                    idx = clean_query.lower().find(city)
                    preceding = clean_query[:idx].rstrip()
                    # Remove joining words
                    for joiner in [" in", " at", " near"]:
                        if preceding.lower().endswith(joiner):
                            preceding = preceding[:-len(joiner)].rstrip()
                    post = clean_query[idx + len(city):].lstrip()
                    clean_query = f"{preceding} {post}".strip()
                    break
        
        if clean_query:
            terms.append(f'"{clean_query}"')
            
        if clean_location:
            terms.append(f'"{clean_location}"')
            
        # Group site operator properly with parentheses, including LinkedIn, Indeed resumes, Upwork, Wellfound, and Xing
        platforms = [
            "site:linkedin.com/in/",
            "site:indeed.com/r/",
            "site:indeed.com/resume/",
            "site:upwork.com/freelancers/",
            "site:wellfound.com/people/",
            "site:xing.com/profile/"
        ]
        search_query = f'({" OR ".join(platforms)}) {" ".join(terms)}'
        
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
                        "num": 20,
                        "start": (page - 1) * 10
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
                    
                    # Try to extract location from snippet or title or default to search location
                    cand_location = extract_location_from_text(
                        title, 
                        snippet, 
                        default_location=clean_location.title() if clean_location else "Remote / Global"
                    )
                    
                    candidate = {
                        "id": f"web-{hash(link)}",
                        "full_name": name,
                        "headline": title,
                        "location": cand_location,
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

    async def search_github_candidates(self, query: str, location: str = "", page: int = 1) -> List[Dict[str, Any]]:
        """Search GitHub for real professional profiles (best for tech)."""
        if not query:
            return []

        search_query = f"{query}"
        if location:
            search_query += f" location:{location}"
        search_query += " type:user"
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    self.github_api_url,
                    params={"q": search_query, "per_page": 5, "page": page},
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
