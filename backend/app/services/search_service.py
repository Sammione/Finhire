# Mock SearchService for Demo
from typing import List, Dict, Any
import uuid

class SearchService:
    def __init__(self):
        self.candidates = {}
        self.index_name = "candidates"
        self._prepopulate()

    def _prepopulate(self):
        """Add high-quality mock data for the demo search."""
        demo_data = [
            {
                "id": str(uuid.uuid4()),
                "full_name": "Sarah Jenkins",
                "headline": "Senior Loan Officer",
                "location": "Seattle, WA",
                "skills": ["Mortgage", "Underwriting", "Fintech", "Leadership"],
                "summary": "Highly experienced loan officer with 8+ years in the fintech sector. Specialized in residential mortgages.",
                "experience_text": "Senior Loan Officer at Fintech Solutions (5 years). Mortgage Consultant at Bank of America (3 years).",
                "match_score": "98%"
            },
            {
                "id": str(uuid.uuid4()),
                "full_name": "Michael Chen",
                "headline": "Risk Analyst",
                "location": "San Francisco, CA",
                "skills": ["Credit Risk", "SQL", "Banking", "Python"],
                "summary": "Expert in financial modeling and credit risk assessment with a focus on emerging markets.",
                "experience_text": "Lead Risk Analyst at Stripe (3 years). Quantitative Analyst at Wells Fargo (4 years).",
                "match_score": "94%"
            },
            {
                "id": str(uuid.uuid4()),
                "full_name": "Elena Rodriguez",
                "headline": "Mortgage Advisor",
                "location": "Austin, TX",
                "skills": ["Sales", "Mortgage", "Consulting", "Customer Relations"],
                "summary": "Passionate advisor with a strong track record in customer satisfaction and loan closing efficiency.",
                "experience_text": "Mortgage Advisor at Quicken Loans (4 years). Sales Associate at Austin Finance (2 years).",
                "match_score": "89%"
            },
            {
                "id": str(uuid.uuid4()),
                "full_name": "David Park",
                "headline": "Fintech Product Manager",
                "location": "New York, NY",
                "skills": ["Product Strategy", "Agile", "API Integration", "Lending Systems"],
                "summary": "Product leader specialized in building automated lending platforms and credit scoring engines.",
                "experience_text": "Product Manager at SoFi (3 years). Associate PM at JPMorgan Chase (2 years).",
                "match_score": "92%"
            }
        ]
        for c in demo_data:
            self.candidates[c["id"]] = c

    async def create_index(self):
        """Mock index creation."""
        pass

    async def index_candidate(self, candidate_id: str, data: Dict[str, Any]):
        """Add candidate to mock search index."""
        self.candidates[candidate_id] = data

    async def search_candidates(self, query: str, filters: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """Perform mock keyword search."""
        if not query or query.strip() == "":
            return list(self.candidates.values())

        query = query.lower()
        results = []
        for c in self.candidates.values():
            if (query in c.get("full_name", "").lower() or 
                query in c.get("headline", "").lower() or 
                query in c.get("summary", "").lower() or
                any(query in s.lower() for s in c.get("skills", []))):
                results.append(c)
            
        return results

search_service = SearchService()


