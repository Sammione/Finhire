import openai
from openai import AsyncOpenAI
# from sentence_transformers import SentenceTransformer # Removed for demo
from app.core.config import settings
from typing import List, Dict, Any
import json

class AIService:
    def __init__(self):
        # self.model = SentenceTransformer('all-MiniLM-L6-v2') # Disabled for demo
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

    async def generate_embedding(self, text: str) -> List[float]:
        """Mock semantic embedding for search."""
        # Return a dummy vector of 384 dimensions
        return [0.0] * 384


    async def parse_profile(self, raw_text: str) -> Dict[str, Any]:
        """Mock LLM parsing for demo."""
        # Simulate extraction from the first few words if possible
        words = raw_text.split()
        first_name = words[0] if len(words) > 0 else "Demo"
        last_name = words[1] if len(words) > 1 else "Candidate"
        
        return {
            "first_name": first_name,
            "last_name": last_name,
            "headline": "Senior Loan Officer",
            "location": "New York, NY",
            "summary": f"Structured data extracted for {raw_text[:30]}...",
            "skills": ["Mortgage", "Lending", "Risk Analysis"],
            "experience": [
                {"title": "Senior Loan Officer", "company": "Bank of America", "description": "Managed high-value loan portfolios."}
            ]
        }

    async def calculate_candidate_score(self, profile: Dict[str, Any]) -> Dict[str, float]:
        """Mock AI scoring for demo."""
        return {
            "overall_score": 0.95,
            "stability_score": 0.92,
            "relevance_score": 0.98,
            "ai_summary": "Strong candidate with relevant fintech experience.",
            "risk_indicators": []
        }

ai_service = AIService()

