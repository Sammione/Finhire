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
