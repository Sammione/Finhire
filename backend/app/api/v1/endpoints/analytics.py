from fastapi import APIRouter, Depends
from app.api import deps
from app.services.analytics_service import analytics_service
from typing import Any

router = APIRouter()

@router.get("/funnel")
def get_hiring_funnel(db: Any = Depends(deps.get_db)) -> Any:
    """Get recruitment funnel metrics."""
    return analytics_service.get_recruitment_funnel(db)

@router.get("/sources")
def get_source_effectiveness(db: Any = Depends(deps.get_db)) -> Any:
    """Get metrics on candidate source quality."""
    return analytics_service.get_source_effectiveness(db)
