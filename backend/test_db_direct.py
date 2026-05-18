import os
from sqlalchemy import create_engine

# Direct connection instead of pooler
url = "postgresql://postgres:omolaiyesam@db.ucxkkbqrztwbzhqigsvo.supabase.co:5432/postgres"

try:
    engine = create_engine(url)
    connection = engine.connect()
    print("Connection successful!")
    connection.close()
except Exception as e:
    print(f"Error connecting: {e}")
