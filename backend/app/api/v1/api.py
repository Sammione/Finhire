from fastapi import APIRouter
from app.api.v1.endpoints import auth, candidates, recruiters, analytics, jobs, pipelines, outreach, settings

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(candidates.router, prefix="/candidates", tags=["candidates"])
api_router.include_router(recruiters.router, prefix="/recruiters", tags=["recruiters"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(jobs.router, prefix="/jobs", tags=["jobs"])
api_router.include_router(pipelines.router, prefix="/pipelines", tags=["pipelines"])
api_router.include_router(outreach.router, prefix="/outreach", tags=["outreach"])
api_router.include_router(settings.router, prefix="/settings", tags=["settings"])
