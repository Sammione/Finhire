from app.db.session import SessionLocal, engine
from app.models.base import Base

def clear_data():
    print("Dropping all tables to clear all data including jobs and candidates...")
    Base.metadata.drop_all(bind=engine)
    print("Recreating tables...")
    Base.metadata.create_all(bind=engine)
    print("Database cleared successfully. Ready for production.")

if __name__ == "__main__":
    clear_data()
