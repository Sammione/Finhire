from app.services.ai_service import ai_service
from app.services.search_service import search_service
from typing import Dict, Any
import uuid

class CandidateIntelligencePipeline:
    async def process_raw_profile(self, db: Any, raw_text: str, candidate_id: uuid.UUID = None) -> Dict:
        """
        Complete pipeline: Parse -> Score -> Persist
        """
        from app.models.domain import Candidate, Intelligence, Experience
        import uuid

        # 1. Parse raw text into structured data
        profile_data = await ai_service.parse_profile(raw_text)
        
        # 2. Get or Create Candidate record
        if candidate_id:
            candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
            if candidate:
                # Update existing candidate with parsed info if missing
                candidate.headline = candidate.headline or profile_data.get("headline")
                candidate.location = candidate.location or profile_data.get("location")
                candidate.summary = candidate.summary or profile_data.get("summary")
        else:
            candidate = Candidate(
                id=uuid.uuid4(),
                first_name=profile_data.get("first_name"),
                last_name=profile_data.get("last_name"),
                headline=profile_data.get("headline"),
                location=profile_data.get("location"),
                summary=profile_data.get("summary"),
                raw_data={"original_text": raw_text}
            )
            db.add(candidate)
        
        db.flush() # Get ID if needed
        
        # 3. Add Experience
        for exp in profile_data.get("experience", []):
            db.add(Experience(
                candidate_id=candidate.id,
                title=exp.get("title"),
                company=exp.get("company"),
                description=exp.get("description")
            ))
        
        # 4. Calculate Scores
        intelligence_data = await ai_service.calculate_candidate_score(profile_data)
        
        # 5. Save Intelligence
        intelligence = Intelligence(
            candidate_id=candidate.id,
            overall_score=intelligence_data.get("overall_score"),
            stability_score=intelligence_data.get("stability_score"),
            relevance_score=intelligence_data.get("relevance_score"),
            ai_summary=intelligence_data.get("ai_summary"),
            skills=profile_data.get("skills", []),
            risk_indicators=intelligence_data.get("risk_indicators", [])
        )
        db.add(intelligence)
        
        db.commit()
        
        return {
            "id": str(candidate.id),
            "full_name": f"{candidate.first_name} {candidate.last_name}",
            "match_score": f"{int(intelligence.overall_score * 100)}%"
        }



intelligence_pipeline = CandidateIntelligencePipeline()
