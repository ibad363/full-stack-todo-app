import sys
from pathlib import Path

# Add backend folder to path so `import src.*` resolves correctly
backend_path = Path(__file__).parent.parent
if str(backend_path) not in sys.path:
    sys.path.insert(0, str(backend_path))

import os
from sqlalchemy import create_engine
from sqlalchemy.pool import StaticPool
from sqlmodel import SQLModel

# Create test engine (SQLite in-memory) BEFORE any app imports
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
test_engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)

# Override the engine in the database module BEFORE app is imported
# Provide minimal env vars required by Settings used in src.core.config
os.environ.setdefault("DATABASE_URL", SQLALCHEMY_DATABASE_URL)
os.environ.setdefault("JWT_SECRET", "test-jwt-secret-that-is-long-enough-for-validation")

import src.core.database as db_module
db_module.engine = test_engine
# Import models so SQLModel metadata includes all table definitions
import src.models  # registers `User` and `Task` models

# Create all tables for the test database
SQLModel.metadata.create_all(test_engine)

# Disable rate limiting for tests
from src.main import limiter as main_limiter
from src.api.auth import limiter as auth_limiter
main_limiter.enabled = False
auth_limiter.enabled = False

