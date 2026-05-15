import openai
from openai import AsyncOpenAI
from app.core.config import settings
from typing import List, Dict, Any
import json

class AIService:
    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

    async def generate_embedding(self, text: str) -> List[float]:
        """Generate real embedding using OpenAI."""
        try:
            response = await self.client.embeddings.create(
                input=text,
                model="text-embedding-3-small"
            )
            return response.data[0].embedding
        except Exception:
            # Fallback to dummy vector if API fails
            return [0.0] * 1536


    async def parse_profile(self, raw_text: str) -> Dict[str, Any]:
        """Use LLM to parse raw professional text into structured data."""
        prompt = f"""
        Extract professional profile data from the following text. Return ONLY a valid JSON object.
        Fields: first_name, last_name, headline, location, summary, skills (list), experience (list of {{title, company, description}}).
        
        Text: {raw_text}
        """
        
        try:
            response = await self.client.chat.completions.create(
                model="gpt-3.5-turbo-0125",
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"}
            )
            return json.loads(response.choices[0].message.content)
        except Exception as e:
            print(f"AI Parsing error: {e}")
            return {
                "first_name": "Error",
                "last_name": "Parsing",
                "headline": "Failed to parse profile",
                "location": "Unknown",
                "summary": "Check API key or text format.",
                "skills": [],
                "experience": []
            }

    async def calculate_candidate_score(self, profile: Dict[str, Any]) -> Dict[str, Any]:
        """Use LLM to score candidate based on fintech/banking relevance and stability."""
        prompt = f"""
        Evaluate this candidate for a high-level banking/fintech role. 
        Provide scores from 0.0 to 1.0 and a summary. Return ONLY JSON.
        Fields: overall_score, stability_score, relevance_score, ai_summary, risk_indicators (list of strings).
        
        Profile: {json.dumps(profile)}
        """
        
        try:
            response = await self.client.chat.completions.create(
                model="gpt-3.5-turbo-0125",
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"}
            )
            return json.loads(response.choices[0].message.content)
        except Exception as e:
            print(f"AI Scoring error: {e}")
            return {
                "overall_score": 0.5,
                "stability_score": 0.5,
                "relevance_score": 0.5,
                "ai_summary": "Error calculating score.",
                "risk_indicators": ["API Communication Error"]
            }

ai_service = AIService()


