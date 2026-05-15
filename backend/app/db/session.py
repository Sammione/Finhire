from sqlalchemy import create_engine

from sqlalchemy.orm import sessionmaker
from app.core.config import settings

engine = create_engine(
    settings.get_database_url(),
    # check_same_thread is needed for SQLite
    connect_args={"check_same_thread": False} if settings.get_database_url().startswith("sqlite") else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
