import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional

class MockDatabase:
    def __init__(self):
        self.users = {}
        self.candidates = {}
        self.experiences = []
        self.intelligence = {}
        
        # Add a default admin user for testing
        admin_id = str(uuid.uuid4())
        self.users[admin_id] = {
            "id": admin_id,
            "email": "admin@finhire.ai",
            "full_name": "Admin User",
            "role": "ADMIN",
            "is_active": True,
            "created_at": datetime.utcnow()
        }

        # Initial candidates for demo
        self._add_demo_candidate(
            "Francis Abimbola", "Senior Loan Officer", "Lagos, NG", 
            0.98, "Highly experienced loan officer with 8+ years in the fintech sector.",
            ["Mortgage", "Underwriting", "Fintech"]
        )
        self._add_demo_candidate(
            "Michael Chen", "Risk Analyst", "San Francisco, CA", 
            0.94, "Expert in financial modeling and credit risk assessment.",
            ["Credit Risk", "SQL", "Banking"]
        )
        self._add_demo_candidate(
            "Elena Rodriguez", "Mortgage Advisor", "Austin, TX", 
            0.89, "Passionate advisor with a strong track record in customer satisfaction.",
            ["Sales", "Mortgage", "Consulting"]
        )

    def _add_demo_candidate(self, name, role, location, score, summary, skills):
        cid = str(uuid.uuid4())
        first, last = name.split(' ', 1)
        candidate = {
            "id": cid,
            "first_name": first,
            "last_name": last,
            "headline": role,
            "location": location,
            "summary": summary,
            "experience": [{"title": role, "company": "Demo Corp", "description": summary}],
            "raw_data": {"demo": True}
        }
        intel = {
            "candidate_id": cid,
            "overall_score": score,
            "stability_score": score - 0.05,
            "relevance_score": score,
            "ai_summary": summary,
            "skills": skills,
            "risk_indicators": []
        }
        self.candidates[cid] = candidate
        self.intelligence[cid] = intel

    # Helper to act like a SQLAlchemy session
    def add(self, item):
        pass # In-memory updates happen directly in our dicts

    def commit(self):
        pass # No need to commit to a file

    def refresh(self, item):
        pass

    def flush(self):
        pass

    # Data methods
    def get_user_by_email(self, email: str):
        return next((u for u in self.users.values() if u["email"] == email), None)

    def get_candidates(self) -> List[Dict]:
        return list(self.candidates.values())

    def get_candidate(self, candidate_id: str):
        return self.candidates.get(candidate_id)

    def save_candidate(self, data: Dict):
        if "id" not in data or not data["id"]:
            data["id"] = str(uuid.uuid4())
        self.candidates[data["id"]] = data
        return data

    def save_intelligence(self, candidate_id: str, data: Dict):
        self.intelligence[candidate_id] = data
        return data

mock_db = MockDatabase()
