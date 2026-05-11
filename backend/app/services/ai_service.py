import openai
from openai import AsyncOpenAI
from sentence_transformers import SentenceTransformer
from app.core.config import settings
from typing import List, Dict, Any
import json

class AIService:
    def __init__(self):
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

    async def generate_embedding(self, text: str) -> List[float]:
        """Generate semantic embedding for search."""
        embedding = self.model.encode(text)
        return embedding.tolist()

    async def parse_profile(self, raw_text: str) -> Dict[str, Any]:
        """Use LLM to extract structured data from professional profiles."""
        prompt = f"""
        Extract professional information from the following text and return it as a JSON object.
        Focus on: first_name, last_name, headline, location, summary, skills, and experience list.
        For experience, include: title, company, dates, description, and whether it is in the financial/loan industry.
        
        Text:
        {raw_text}
        """
        
        response = await self.client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are an expert recruitment data extraction assistant. Return only valid JSON."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"}
        )
        
        return json.loads(response.choices[0].message.content)

    async def calculate_candidate_score(self, profile: Dict[str, Any]) -> Dict[str, float]:
        """
        AI-driven scoring algorithm.
        Calculates stability, fintech relevance, and overall fit.
        """
        prompt = f"""
        Evaluate this financial professional profile for a loan company recruiter.
        Score from 0.0 to 1.0 for:
        1. stability_score (length of tenure, lack of job hopping)
        2. relevance_score (experience in loans, banking, financial tech)
        3. overall_score
        
        Provide a short 'ai_summary' and identify 'risk_indicators' (e.g., job gaps).
        
        Profile:
        {json.dumps(profile)}
        """
        
        response = await self.client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a senior financial talent analyst. Return only valid JSON."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"}
        )
        
        return json.loads(response.choices[0].message.content)

ai_service = AIService()
