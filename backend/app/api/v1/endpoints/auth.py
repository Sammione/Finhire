from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from app.core import security
from app.core.config import settings
from app.api import deps
from app.schemas.token import Token
from typing import Any

router = APIRouter()
@router.post("/login/access-token", response_model=Token)
async def login_access_token(
    db: Any = Depends(deps.get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    # Placeholder for actual user verification
    # In a real app, you'd check form_data.username and form_data.password against the DB
    if form_data.username != "admin@finhire.iq" or form_data.password != "password":
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            form_data.username, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }
