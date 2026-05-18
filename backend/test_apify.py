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
    test_urls = [
        "https://www.linkedin.com/in/williamhgates"
    ]
    print(f"Testing RapidAPI enrichment for {len(test_urls)} profiles...")
    print(f"RAPIDAPI_KEY is set: {bool(os.getenv('RAPIDAPI_KEY'))}")
    
    try:
        results = await external_search_service.enrich_linkedin_profiles(test_urls)
        print(f"\nSuccessfully enriched {len(results)} profiles.")
        
        for i, profile in enumerate(results):
            print(f"\n--- Raw Profile {i+1} ---")
            import json
            print(json.dumps(profile, indent=2))
            print(f"Location: {profile.get('location')}")
            print(f"Summary: {profile.get('summary')}")
            
            # Print recent experience
            experiences = profile.get('experience', [])
            if experiences:
                print(f"Recent Job: {experiences[0].get('title')} at {experiences[0].get('companyName')}")
            
    except Exception as e:
        print(f"Error occurred during enrichment: {e}")

if __name__ == "__main__":
    asyncio.run(main())
