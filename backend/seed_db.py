from app.db.session import SessionLocal, engine
from app.models.base import Base
from app.models.domain import Candidate, Intelligence, Experience
import uuid

def seed():
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Check if already seeded
        if db.query(Candidate).first():
            print("Database already seeded.")
            return

        print("Seeding database with initial candidates...")
        
        # Candidate 1: Francis Abimbola (Transferred from mock to real)
        francis = Candidate(
            id=uuid.uuid4(),
            first_name="Francis",
            last_name="Abimbola",
            headline="Senior Loan Officer",
            location="Lagos, NG",
            summary="Highly experienced loan officer with 8+ years in the fintech sector. Specialized in residential mortgages.",
            raw_data={"source": "seed"}
        )
        db.add(francis)
        db.flush()
        
        db.add(Intelligence(
            candidate_id=francis.id,
            overall_score=0.98,
            stability_score=0.93,
            relevance_score=0.98,
            ai_summary="Top-tier candidate with deep mortgage expertise.",
            skills=["Mortgage", "Underwriting", "Fintech"],
            risk_indicators=[]
        ))
        
        # Candidate 2: Michael Chen
        michael = Candidate(
            id=uuid.uuid4(),
            first_name="Michael",
            last_name="Chen",
            headline="Risk Analyst",
            location="San Francisco, CA",
            summary="Expert in financial modeling and credit risk assessment with a focus on emerging markets.",
            raw_data={"source": "seed"}
        )
        db.add(michael)
        db.flush()
        
        db.add(Intelligence(
            candidate_id=michael.id,
            overall_score=0.94,
            stability_score=0.89,
            relevance_score=0.95,
            ai_summary="Strong quantitative background.",
            skills=["Credit Risk", "SQL", "Banking", "Python"],
            risk_indicators=[]
        ))

        db.commit()
        print("Seeding complete.")
    except Exception as e:
        print(f"Seeding failed: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed()
