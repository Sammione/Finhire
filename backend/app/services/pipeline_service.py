from app.services.ai_service import ai_service
from app.services.search_service import search_service
from app.models.domain import Candidate, Intelligence, Experience
from sqlalchemy.orm import Session
from typing import Dict, Any

class CandidateIntelligencePipeline:
    async def process_raw_profile(self, db: Session, raw_text: str) -> Candidate:
        """
        Complete pipeline: Parse -> Score -> Index
        """
        # 1. Parse raw text into structured data
        profile_data = await ai_service.parse_profile(raw_text)
        
        # 2. Create Candidate record
        candidate = Candidate(
            first_name=profile_data.get("first_name"),
            last_name=profile_data.get("last_name"),
            headline=profile_data.get("headline"),
            location=profile_data.get("location"),
            summary=profile_data.get("summary"),
            raw_data={"original_text": raw_text}
        )
        db.add(candidate)
        db.flush() # Get ID
        
        # 3. Add Experience
        for exp in profile_data.get("experience", []):
            experience = Experience(
                candidate_id=candidate.id,
                title=exp.get("title"),
                company=exp.get("company"),
                description=exp.get("description"),
                is_fintech=exp.get("is_fintech", False)
            )
            db.add(experience)
            
        # 4. Calculate Scores
        intelligence_data = await ai_service.calculate_candidate_score(profile_data)
        
        # 5. Generate Embedding
        embedding = await ai_service.generate_embedding(
            f"{candidate.headline} {candidate.summary} " + 
            " ".join([e.get("description", "") for e in profile_data.get("experience", [])])
        )
        
        # 6. Save Intelligence
        intelligence = Intelligence(
            candidate_id=candidate.id,
            overall_score=intelligence_data.get("overall_score"),
            stability_score=intelligence_data.get("stability_score"),
            relevance_score=intelligence_data.get("relevance_score"),
            ai_summary=intelligence_data.get("ai_summary"),
            skills=profile_data.get("skills", []),
            risk_indicators=intelligence_data.get("risk_indicators", []),
            embedding=embedding
        )
        db.add(intelligence)
        
        # 7. Commit to DB
        db.commit()
        db.refresh(candidate)
        
        # 8. Index in Search Engine
        search_data = {
            "full_name": f"{candidate.first_name} {candidate.last_name}",
            "headline": candidate.headline,
            "location": candidate.location,
            "skills": intelligence.skills,
            "summary": candidate.summary,
            "experience_text": " ".join([e.description for e in candidate.experience]),
            "embedding": embedding
        }
        await search_service.index_candidate(str(candidate.id), search_data)
        
        return candidate

intelligence_pipeline = CandidateIntelligencePipeline()
