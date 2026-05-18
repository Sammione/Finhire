import os
from sqlalchemy import create_engine

url = "postgresql://postgres.ucxkkbqrztwbzhqigsvo:omolaiyesam@aws-0-eu-west-1.pooler.supabase.com:5432/postgres"

try:
    engine = create_engine(url)
    connection = engine.connect()
    print("Connection successful on port 5432 without sslmode!")
    connection.close()
except Exception as e:
    print(f"Error connecting without sslmode: {e}")
