import pytest
from sqlmodel import Session, select
from fastapi.testclient import TestClient
from unittest.mock import patch
from main import app
from modules.core.database import engine, init_db
from modules.models.user import User, UserRegister
from modules.models.task import Task, TaskCreate
from modules.core.security import hash_password


@pytest.fixture(scope="function")
def client():
    """Create a test client with a clean database for each test."""
    # Create tables
    # init_db() - handled by conftest.py


    with TestClient(app) as client:
        yield client

    # Clean up after test (optional, depending on your testing strategy)


def test_task_persistence_across_sessions(client: TestClient):
    """Test that tasks persist across database sessions."""
    # Register a new user
    user_data = {
        "email": "test@example.com",
        "password": "testpassword123"
    }
    response = client.post("/api/auth/register", json=user_data)
    assert response.status_code == 201
    user_response = response.json()
    assert user_response["email"] == "test@example.com"
    
    # Login to get token
    login_response = client.post("/api/auth/login", json=user_data)
    assert login_response.status_code == 200
    token_response = login_response.json()

    # Extract the token from the response
    token = token_response.get("access_token")
    assert token is not None

    # Create a task
    task_data = {
        "title": "Test persistence task",
        "description": "This task should persist across sessions"
    }
    headers = {"Authorization": f"Bearer {token}"}
    response = client.post("/api/tasks", json=task_data, headers=headers)
    assert response.status_code == 201
    task_response = response.json()
    task_id = task_response["id"]
    assert task_response["title"] == "Test persistence task"
    assert task_response["description"] == "This task should persist across sessions"

    # Verify task exists in database directly
    with Session(engine) as session:
        task = session.get(Task, task_id)
        assert task is not None
        assert task.title == "Test persistence task"
        assert task.description == "This task should persist across sessions"
        assert task.user_id == user_response["id"]

    # Close session and create a new one to simulate "across sessions"
    # This simulates the persistence requirement by verifying the task exists in the database
    with Session(engine) as session:
        task = session.get(Task, task_id)
        assert task is not None
        assert task.title == "Test persistence task"
        assert task.description == "This task should persist across sessions"

    # Update the task
    update_data = {
        "title": "Updated persistence task",
        "description": "This task has been updated and should still persist"
    }
    response = client.patch(f"/api/tasks/{task_id}", json=update_data, headers=headers)
    assert response.status_code == 200
    updated_task = response.json()
    assert updated_task["title"] == "Updated persistence task"
    assert updated_task["description"] == "This task has been updated and should still persist"

    # Verify update persisted in database
    with Session(engine) as session:
        updated_task_db = session.get(Task, task_id)
        assert updated_task_db is not None
        assert updated_task_db.title == "Updated persistence task"
        assert updated_task_db.description == "This task has been updated and should still persist"

    # Delete the task
    response = client.delete(f"/api/tasks/{task_id}", headers=headers)
    assert response.status_code == 200

    # Verify deletion persisted (task no longer exists)
    with Session(engine) as session:
        deleted_task = session.get(Task, task_id)
        assert deleted_task is None


def test_multiple_users_task_isolation_persistence(client: TestClient):
    """Test that tasks from different users are properly isolated and persist separately."""
    # Register first user
    user1_data = {
        "email": "user1@example.com",
        "password": "password123"
    }
    response = client.post("/api/auth/register", json=user1_data)
    assert response.status_code == 201
    user1_response = response.json()
    assert user1_response["email"] == "user1@example.com"
    
    # Login user 1
    login1_response = client.post("/api/auth/login", json=user1_data)
    user1_token = login1_response.json().get("access_token")
    assert user1_token is not None

    # Register second user
    user2_data = {
        "email": "user2@example.com",
        "password": "password123"
    }
    response = client.post("/api/auth/register", json=user2_data)
    assert response.status_code == 201
    user2_response = response.json()
    assert user2_response["email"] == "user2@example.com"
    
    # Login user 2
    login2_response = client.post("/api/auth/login", json=user2_data)
    user2_token = login2_response.json().get("access_token")
    assert user2_token is not None

    # Create tasks for user 1
    task1_data = {"title": "User 1 task", "description": "Task for user 1"}
    headers1 = {"Authorization": f"Bearer {user1_token}"}
    response = client.post("/api/tasks", json=task1_data, headers=headers1)
    assert response.status_code == 201
    task1 = response.json()
    task1_id = task1["id"]

    # Create tasks for user 2
    task2_data = {"title": "User 2 task", "description": "Task for user 2"}
    headers2 = {"Authorization": f"Bearer {user2_token}"}
    response = client.post("/api/tasks", json=task2_data, headers=headers2)
    assert response.status_code == 201
    task2 = response.json()
    task2_id = task2["id"]

    # Verify each user can only see their own tasks
    response = client.get("/api/tasks", headers=headers1)
    assert response.status_code == 200
    user1_tasks = response.json()
    user1_task_ids = [task["id"] for task in user1_tasks]
    assert task1_id in user1_task_ids
    assert task2_id not in user1_task_ids

    response = client.get("/api/tasks", headers=headers2)
    assert response.status_code == 200
    user2_tasks = response.json()
    user2_task_ids = [task["id"] for task in user2_tasks]
    assert task2_id in user2_task_ids
    assert task1_id not in user2_task_ids

    # Verify in database that both tasks exist but are properly isolated
    with Session(engine) as session:
        task1_db = session.get(Task, task1_id)
        task2_db = session.get(Task, task2_id)
        assert task1_db is not None
        assert task2_db is not None
        assert task1_db.user_id == user1_response["id"]
        assert task2_db.user_id == user2_response["id"]