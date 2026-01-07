import sys
from pathlib import Path

# Add backend to path for imports
backend_path = Path(__file__).parent.parent
sys.path.insert(0, str(backend_path))

from fastapi.testclient import TestClient
from sqlalchemy.orm import sessionmaker
import pytest
from datetime import datetime
from sqlmodel import SQLModel

# conftest.py already sets up the test engine override
from main import app
from modules.models.user import User
from modules.models.task import Task
from modules.core.security import hash_password
from modules.api.dependencies import get_session

# Import test_engine from conftest which sets up the SQLite test database
from conftest import test_engine

# Test database setup
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


def override_get_session():
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


app.dependency_overrides[get_session] = override_get_session






@pytest.fixture(autouse=True)
def setup_database():
    SQLModel.metadata.create_all(test_engine)
    yield
    SQLModel.metadata.drop_all(test_engine)


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def test_user():
    user = User(
        email="task_user@example.com",
        password_hash=hash_password("password123"),
    )
    session = TestingSessionLocal()
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@pytest.fixture
def other_user():
    user = User(
        email="other@example.com",
        password_hash=hash_password("password123"),
    )
    session = TestingSessionLocal()
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@pytest.fixture
def auth_headers(test_user, client):
    # Login to get token
    response = client.post(
        "/api/auth/login",
        json={"email": "task_user@example.com", "password": "password123"}
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def create_test_task(user_id, title="Test Task", description="Test Description", completed=False):
    session = TestingSessionLocal()
    task = Task(
        user_id=user_id,
        title=title,
        description=description,
        completed=completed,
    )
    session.add(task)
    session.commit()
    session.refresh(task)
    return task


class TestTaskCRUD:
    """Test backend task CRUD operations."""

    def test_create_task(self, client, auth_headers, test_user):
        """Test creating a new task."""
        response = client.post(
            "/api/tasks",
            json={"title": "New Task", "description": "Task description"},
            headers=auth_headers
        )
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "New Task"
        assert data["description"] == "Task description"
        assert data["completed"] == False
        assert data["user_id"] == test_user.id
        assert "id" in data
        assert "created_at" in data

    def test_create_task_with_minimal_data(self, client, auth_headers, test_user):
        """Test creating a task with only title."""
        response = client.post(
            "/api/tasks",
            json={"title": "Minimal Task"},
            headers=auth_headers
        )
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "Minimal Task"
        assert data["description"] is None

    def test_create_task_empty_title_fails(self, client, auth_headers):
        """Test that creating a task with empty title fails."""
        response = client.post(
            "/api/tasks",
            json={"title": ""},
            headers=auth_headers
        )
        assert response.status_code == 422

    def test_create_task_title_too_long_fails(self, client, auth_headers):
        """Test that creating a task with title > 200 chars fails."""
        long_title = "x" * 201
        response = client.post(
            "/api/tasks",
            json={"title": long_title},
            headers=auth_headers
        )
        assert response.status_code == 422

    def test_list_tasks(self, client, auth_headers, test_user):
        """Test listing tasks filtered by user."""
        # Create tasks for test user
        create_test_task(test_user.id, "Task 1")
        create_test_task(test_user.id, "Task 2")

        response = client.get("/api/tasks", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2

    def test_list_tasks_shows_incomplete_first(self, client, auth_headers, test_user):
        """Test that incomplete tasks are listed first."""
        create_test_task(test_user.id, "Completed Task", completed=True)
        create_test_task(test_user.id, "Incomplete Task")

        response = client.get("/api/tasks", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        # Incomplete task should come first
        assert data[0]["title"] == "Incomplete Task"
        assert data[0]["completed"] == False

    def test_list_tasks_only_shows_own_tasks(self, client, auth_headers, test_user, other_user):
        """Test that users only see their own tasks."""
        create_test_task(other_user.id, "Other User Task")
        create_test_task(test_user.id, "My Task")

        response = client.get("/api/tasks", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        # Should only contain test user's task
        assert len(data) == 1
        assert data[0]["title"] == "My Task"

    def test_list_tasks_unauthorized(self, client):
        """Test that listing tasks without auth returns 401."""
        response = client.get("/api/tasks")
        assert response.status_code == 401

    def test_get_task_by_id(self, client, auth_headers, test_user):
        """Test getting a specific task by ID."""
        task = create_test_task(test_user.id, "Get Me")

        response = client.get(f"/api/tasks/{task.id}", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == task.id
        assert data["title"] == "Get Me"

    def test_get_task_not_found(self, client, auth_headers):
        """Test getting a non-existent task returns 404."""
        response = client.get("/api/tasks/99999", headers=auth_headers)
        assert response.status_code == 404

    def test_get_task_unauthorized_access(self, client, auth_headers, other_user):
        """Test that getting another user's task returns 403."""
        task = create_test_task(other_user.id, "Not My Task")

        response = client.get(f"/api/tasks/{task.id}", headers=auth_headers)
        assert response.status_code == 403

    def test_update_task(self, client, auth_headers, test_user):
        """Test updating a task's title and description."""
        task = create_test_task(test_user.id, "Original Title")

        response = client.patch(
            f"/api/tasks/{task.id}",
            json={"title": "Updated Title", "description": "New description"},
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Updated Title"
        assert data["description"] == "New description"

    def test_update_task_partial(self, client, auth_headers, test_user):
        """Test partial update - only title."""
        task = create_test_task(test_user.id, "Original", description="Original desc")

        response = client.patch(
            f"/api/tasks/{task.id}",
            json={"title": "New Title Only"},
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "New Title Only"
        assert data["description"] == "Original desc"  # Unchanged

    def test_update_task_not_found(self, client, auth_headers):
        """Test updating non-existent task returns 404."""
        response = client.patch(
            "/api/tasks/99999",
            json={"title": "Won't work"},
            headers=auth_headers
        )
        assert response.status_code == 404

    def test_update_task_unauthorized_access(self, client, auth_headers, other_user):
        """Test that updating another user's task returns 403."""
        task = create_test_task(other_user.id, "Not My Task")

        response = client.patch(
            f"/api/tasks/{task.id}",
            json={"title": "Hacked!"},
            headers=auth_headers
        )
        assert response.status_code == 403

    def test_toggle_task(self, client, auth_headers, test_user):
        """Test toggling task completion status."""
        task = create_test_task(test_user.id, "Toggle Me", completed=False)

        response = client.patch(f"/api/tasks/{task.id}/toggle", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["completed"] == True
        assert data["completed_at"] is not None

    def test_toggle_task_back(self, client, auth_headers, test_user):
        """Test toggling completed task back to incomplete."""
        task = create_test_task(test_user.id, "Toggle Me", completed=True)

        response = client.patch(f"/api/tasks/{task.id}/toggle", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["completed"] == False
        assert data["completed_at"] is None

    def test_toggle_task_not_found(self, client, auth_headers):
        """Test toggling non-existent task returns 404."""
        response = client.patch("/api/tasks/99999/toggle", headers=auth_headers)
        assert response.status_code == 404

    def test_toggle_task_unauthorized_access(self, client, auth_headers, other_user):
        """Test that toggling another user's task returns 403."""
        task = create_test_task(other_user.id, "Not My Task")

        response = client.patch(f"/api/tasks/{task.id}/toggle", headers=auth_headers)
        assert response.status_code == 403

    def test_delete_task(self, client, auth_headers, test_user):
        """Test deleting a task."""
        task = create_test_task(test_user.id, "Delete Me")

        response = client.delete(f"/api/tasks/{task.id}", headers=auth_headers)
        assert response.status_code == 200

        # Verify task is deleted
        get_response = client.get(f"/api/tasks/{task.id}", headers=auth_headers)
        assert get_response.status_code == 404

    def test_delete_task_not_found(self, client, auth_headers):
        """Test deleting non-existent task returns 404."""
        response = client.delete("/api/tasks/99999", headers=auth_headers)
        assert response.status_code == 404

    def test_delete_task_unauthorized_access(self, client, auth_headers, other_user):
        """Test that deleting another user's task returns 403."""
        task = create_test_task(other_user.id, "Not My Task")

        response = client.delete(f"/api/tasks/{task.id}", headers=auth_headers)
        assert response.status_code == 403
