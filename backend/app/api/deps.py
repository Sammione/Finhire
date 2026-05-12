from typing import Generator
from sqlalchemy.orm import Session
from app.core.config import settings
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

connect_args = {"check_same_thread": False} if settings.get_database_url().startswith("sqlite") else {}
engine = create_engine(settings.get_database_url(), connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db() -> Generator:
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()
