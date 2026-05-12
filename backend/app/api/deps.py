from typing import Generator
from app.core.mock_db import mock_db

def get_db() -> Generator:
    try:
        yield mock_db
    finally:
        pass
