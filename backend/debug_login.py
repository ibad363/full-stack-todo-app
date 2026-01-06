import sys
from pathlib import Path

# Add backend to path for imports
backend_path = Path(__file__).parent
sys.path.insert(0, str(backend_path))

from fastapi.testclient import TestClient
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel
from sqlalchemy import create_engine

# Setup test DB
from src.main import app
from src.models.user import User
from src.core.security import hash_password
from src.api.dependencies import get_session

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
from sqlalchemy.pool import StaticPool
test_engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

def override_get_session():
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()

app.dependency_overrides[get_session] = override_get_session


print("Creating tables...")
SQLModel.metadata.create_all(test_engine)
print("Tables created:", list(SQLModel.metadata.tables.keys()))


# Create user
session = TestingSessionLocal()
user = User(
    email="test@example.com",
    password_hash=hash_password("password123"),
)
session.add(user)
session.commit()
session.refresh(user)
session.close()

client = TestClient(app)

print("Attempting login...")
response = client.post(
    "/api/auth/login",
    json={"email": "test@example.com", "password": "password123"}
)

print(f"Status Code: {response.status_code}")
print(f"Response: {response.text}")
