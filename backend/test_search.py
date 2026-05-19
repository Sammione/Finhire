import asyncio
from dotenv import load_dotenv
import os
import sys

# Set stdout to use utf-8
sys.stdout.reconfigure(encoding='utf-8')

# Load environment variables first
load_dotenv()

# Force local SQLite database to prevent cloud Supabase connection timeouts in the sandbox
os.environ["DATABASE_URL"] = "sqlite:///./finhireiq.db"

from app.db.session import SessionLocal
from app.models.domain import Candidate, Intelligence
from app.services.search_service import search_service
import uuid

async def main():
    db = SessionLocal()
    
    # 1. Clean up any previous test candidates to avoid cluttering (delete referencing Intelligence rows first due to FK constraints)
    test_cand_ids = [c.id for c in db.query(Candidate).filter(Candidate.first_name.in_(["LagosTest", "NYTest"])).all()]
    if test_cand_ids:
        db.query(Intelligence).filter(Intelligence.candidate_id.in_(test_cand_ids)).delete(synchronize_session=False)
        db.query(Candidate).filter(Candidate.id.in_(test_cand_ids)).delete(synchronize_session=False)
        db.commit()
    
    # 2. Add test candidates
    print("Seeding temporary test candidates to database...")
    lagos_cand = Candidate(
        id=uuid.uuid4(),
        first_name="LagosTest",
        last_name="Manager",
        headline="Senior Loan Manager",
        location="Lagos, Nigeria",
        summary="Specialized in retail credit and loan portfolios.",
        raw_data={"source": "test"}
    )
    ny_cand = Candidate(
        id=uuid.uuid4(),
        first_name="NYTest",
        last_name="Manager",
        headline="Senior Loan Manager",
        location="New York, NY",
        summary="Specialized in retail credit and loan portfolios.",
        raw_data={"source": "test"}
    )
    db.add(lagos_cand)
    db.add(ny_cand)
    db.flush()
    
    # Add intelligence scoring
    db.add(Intelligence(
        candidate_id=lagos_cand.id,
        overall_score=0.95,
        skills=["Credit Analysis", "Loan Management"],
        risk_indicators=[]
    ))
    db.add(Intelligence(
        candidate_id=ny_cand.id,
        overall_score=0.95,
        skills=["Credit Analysis", "Loan Management"],
        risk_indicators=[]
    ))
    db.commit()

    # Define queries to test
    queries = [
        "loan manager in lagos",
        "loan manager lagos",
        "loan officer in lagos"
    ]
    
    for query in queries:
        print(f"\n==================================================")
        print(f"RUNNING SEARCH FOR: '{query}'")
        print(f"==================================================")
        
        try:
            results = await search_service.search_candidates(db, query)
            print(f"Found {len(results)} total candidates matching criteria.")
            
            for i, candidate in enumerate(results):
                print(f"\n--- Result {i+1} ---")
                print(f"Name: {candidate.get('full_name')}")
                print(f"Headline: {candidate.get('headline')}")
                print(f"Location: {candidate.get('location')}")
                print(f"Source: {candidate.get('source')}")
                print(f"Match Score: {candidate.get('match_score')}")
                
        except Exception as e:
            print(f"Error occurred during search: {e}")

    # Clean up test candidates (delete referencing Intelligence rows first due to FK constraints)
    print("\nCleaning up test candidates from database...")
    test_cand_ids = [c.id for c in db.query(Candidate).filter(Candidate.first_name.in_(["LagosTest", "NYTest"])).all()]
    if test_cand_ids:
        db.query(Intelligence).filter(Intelligence.candidate_id.in_(test_cand_ids)).delete(synchronize_session=False)
        db.query(Candidate).filter(Candidate.id.in_(test_cand_ids)).delete(synchronize_session=False)
        db.commit()
    db.close()

if __name__ == "__main__":
    asyncio.run(main())
