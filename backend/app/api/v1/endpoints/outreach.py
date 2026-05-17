from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.domain import Campaign
from pydantic import BaseModel

router = APIRouter()

class CampaignCreate(BaseModel):
    name: str

@router.get("/")
async def get_campaigns(db: Session = Depends(deps.get_db)):
    """Get all active campaigns."""
    campaigns = db.query(Campaign).all()
    return [{
        "id": str(c.id),
        "name": c.name,
        "status": c.status,
        "emails_sent": c.emails_sent,
        "open_rate": c.open_rate,
        "reply_rate": c.reply_rate
    } for c in campaigns]

@router.post("/")
async def create_campaign(
    campaign: CampaignCreate,
    db: Session = Depends(deps.get_db)
):
    """Create a new automated outreach campaign."""
    # In a real app, this would trigger a background task to generate emails via OpenAI
    new_campaign = Campaign(
        name=campaign.name,
        status="Active",
        emails_sent=0,
        open_rate=0.0,
        reply_rate=0.0
    )
    db.add(new_campaign)
    db.commit()
    return {"status": "success", "id": str(new_campaign.id)}
