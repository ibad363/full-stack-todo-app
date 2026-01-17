import sys
from pathlib import Path

# Add backend to path for imports
backend_path = Path(__file__).parent.parent
sys.path.insert(0, str(backend_path))

from fastapi.testclient import TestClient
import pytest
from src.main import app
from src.api.dependencies import get_session
from sqlmodel import Session, SQLModel, create_engine
from sqlalchemy.orm import sessionmaker

# Mock database setup if needed, but for routing tests we mostly care about status codes
# and whether the request reach the router.

@pytest.fixture
def client():
    # We use the real app but we might want to override dependencies if needed
    # For routing tests, we just want to see if /api/tasks/ and /api/tasks 
    # both return the same thing (even if it's 401 Unauthorized)
    return TestClient(app)

def test_trailing_slash_normalization(client):
    """Test that requests with trailing slashes are handled correctly."""
    
    # Test /api/health (exists)
    response_no_slash = client.get("/api/health")
    assert response_no_slash.status_code == 200
    assert response_no_slash.json() == {"status": "ok"}
    
    response_slash = client.get("/api/health/")
    assert response_slash.status_code == 200
    assert response_slash.json() == {"status": "ok"}
    
    # Test /api/tasks (exists, but requires auth)
    # Both should return 401 (not 404 or 307)
    response_no_slash = client.get("/api/tasks")
    assert response_no_slash.status_code == 401
    
    response_slash = client.get("/api/tasks/")
    assert response_slash.status_code == 401
    
    # Test with sub-routes
    response_no_slash = client.get("/api/auth/login")
    # Method Not Allowed for GET, but let's see if we get 405 or 404
    assert response_no_slash.status_code == 405
    
    response_slash = client.get("/api/auth/login/")
    assert response_slash.status_code == 405

def test_no_normalization_for_root(client):
    """Test that root path is not affected (it doesn't have a trailing slash to strip that results in non-empty)."""
    # FastAPI usually has a default 404 for root if not defined, 
    # or whatever is defined.
    response = client.get("/")
    # Check if it doesn't crash
    assert response.status_code in [200, 404]
