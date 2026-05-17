from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.domain import Settings
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

class SettingsUpdate(BaseModel):
    company_name: Optional[str]
    industry: Optional[str]
    stability_weight: Optional[float]
    fintech_weight: Optional[float]
    skill_match_weight: Optional[float]
    ethical_bias_mitigation: Optional[bool]
    auto_refresh: Optional[bool]

@router.get("/")
async def get_settings(db: Session = Depends(deps.get_db)):
    """Get current organization settings."""
    settings = db.query(Settings).first()
    if not settings:
        settings = Settings()
        db.add(settings)
        db.commit()
        db.refresh(settings)
        
    return {
        "company_name": settings.company_name,
        "industry": settings.industry,
        "stability_weight": settings.stability_weight,
        "fintech_weight": settings.fintech_weight,
        "skill_match_weight": settings.skill_match_weight,
        "ethical_bias_mitigation": settings.ethical_bias_mitigation,
        "auto_refresh": settings.auto_refresh
    }

@router.put("/")
async def update_settings(
    settings_data: SettingsUpdate,
    db: Session = Depends(deps.get_db)
):
    """Update organization settings."""
    settings = db.query(Settings).first()
    if not settings:
        settings = Settings()
        db.add(settings)
        
    update_dict = settings_data.dict(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(settings, key, value)
        
    db.commit()
    return {"status": "success", "message": "Settings updated"}
