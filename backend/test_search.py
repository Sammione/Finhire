import asyncio
from dotenv import load_dotenv
import os
import sys

# Set stdout to use utf-8
sys.stdout.reconfigure(encoding='utf-8')

# Load environment variables first
load_dotenv()

from app.services.external_search_service import external_search_service

async def main():
    query = "loan collector lagos"
    print(f"Testing search for: {query}")
    print(f"SERPAPI_API_KEY is set: {bool(os.getenv('SERPAPI_API_KEY'))}")
    
    try:
        results = await external_search_service.search_candidates(query)
        print(f"\nFound {len(results)} total candidates.")
        
        for i, candidate in enumerate(results):
            print(f"\n--- Candidate {i+1} ---")
            print(f"Name: {candidate.get('full_name')}")
            print(f"Headline: {candidate.get('headline')}")
            print(f"Location: {candidate.get('location')}")
            print(f"Summary: {candidate.get('summary')}")
            print(f"Skills: {candidate.get('skills')}")
            
    except Exception as e:
        print(f"Error occurred during search: {e}")

if __name__ == "__main__":
    asyncio.run(main())
