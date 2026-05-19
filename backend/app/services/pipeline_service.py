from app.services.ai_service import ai_service
from app.services.search_service import search_service
from typing import Dict, Any
import uuid

class CandidateIntelligencePipeline:
    async def process_raw_profile(self, db: Any, raw_text: str, candidate_id: uuid.UUID = None, job_id: str = None, profile_url: str = None) -> Dict:
        """
        Complete pipeline: Parse -> Score -> Persist -> Associate with Pipeline
        """
        from app.models.domain import Candidate, Intelligence, Experience, Job, Application, ApplicationStatus
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
                if profile_url:
                    if not candidate.raw_data:
                        candidate.raw_data = {"original_url": profile_url}
                    elif isinstance(candidate.raw_data, dict):
                        candidate.raw_data["original_url"] = profile_url
        else:
            candidate = Candidate(
                id=uuid.uuid4(),
                first_name=profile_data.get("first_name"),
                last_name=profile_data.get("last_name"),
                headline=profile_data.get("headline"),
                location=profile_data.get("location"),
                summary=profile_data.get("summary"),
                raw_data={"original_text": raw_text, "original_url": profile_url}
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
        
        # 6. Associate Candidate with a recruitment Job / Application
        resolved_job_id = None
        if job_id and job_id.strip() != "":
            try:
                resolved_job_id = uuid.UUID(job_id)
            except ValueError:
                resolved_job_id = job_id
        else:
            # Fallback: link to the first active job vacancy in the database so they appear in pipelines
            first_job = db.query(Job).first()
            resolved_job_id = first_job.id if first_job else None
            
        if resolved_job_id:
            # Check if application already exists
            existing_app = db.query(Application).filter(
                Application.candidate_id == candidate.id,
                Application.job_id == resolved_job_id
            ).first()
            
            if not existing_app:
                db.add(Application(
                    candidate_id=candidate.id,
                    job_id=resolved_job_id,
                    status=ApplicationStatus.APPLIED
                ))
        
        db.commit()
        
        return {
            "id": str(candidate.id),
            "full_name": f"{candidate.first_name} {candidate.last_name}",
            "match_score": f"{int(intelligence.overall_score * 100)}%"
        }



intelligence_pipeline = CandidateIntelligencePipeline()
