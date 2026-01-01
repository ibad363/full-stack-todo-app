# Data Model: Multi-User Task Management

**Feature Branch**: `001-task-crud`
**Created**: 2026-01-01
**Status**: Phase 1 Design Complete
**Based on**: `@specs/001-task-crud/spec.md`, `@specs/001-task-crud/research.md`

## Overview

This document defines the database schema for the multi-user task management application. The data model enforces strict user isolation, supports all functional requirements, and aligns with the project constitution's principles of authentication, authorization, and data integrity.

## Entities

### User

Represents an authenticated user who can create and manage tasks.

**Purpose**: Identity layer, authentication credentials, and task ownership anchor.

**Attributes**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | `INTEGER` | PRIMARY KEY, AUTO_INCREMENT | Unique user identifier |
| `email` | `VARCHAR(255)` | UNIQUE, NOT NULL | User's email address (login identifier) |
| `password_hash` | `VARCHAR(255)` | NOT NULL | Argon2-hashed password |
| `created_at` | `TIMESTAMP` | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Account creation timestamp (UTC) |

**Validation Rules**:
- Email format: Valid email address (RFC 5322)
- Email uniqueness: Enforced at database level
- Password minimum length: 8 characters (enforced at application level)
- Password hashing: Argon2id with `pwdlib` (not bcrypt, per research recommendation)

**Relationships**:
- One-to-Many: User → Tasks (via `user_id` foreign key in `Task` entity)
- Cascade delete: Deleting a user deletes all associated tasks (maintains data integrity, per spec FR-017a)

**SQLModel Definition**:

```python
from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True, max_length=255)
    password_hash: str = Field(max_length=255)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationship to tasks (optional, for joined queries)
    tasks: list["Task"] = Relationship(back_populates="user")
```

**Indexing**:
- `email`: Unique index (for login queries and uniqueness enforcement)

---

### Task

Represents a work item owned by a specific user.

**Purpose**: Core business entity, stores task data and ownership information.

**Attributes**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | `INTEGER` | PRIMARY KEY, AUTO_INCREMENT | Unique task identifier |
| `user_id` | `INTEGER` | NOT NULL, FOREIGN KEY → User(id) | Owner user ID (enforces isolation) |
| `title` | `VARCHAR(200)` | NOT NULL | Task title |
| `description` | `VARCHAR(2000)` | NULLABLE | Optional task description |
| `completed` | `BOOLEAN` | NOT NULL, DEFAULT FALSE | Completion status |
| `created_at` | `TIMESTAMP` | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Task creation timestamp (UTC) |
| `updated_at` | `TIMESTAMP` | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Last modification timestamp (UTC) |
| `completed_at` | `TIMESTAMP` | NULLABLE | Timestamp when task was marked complete (UTC) |

**Validation Rules** (per spec FR-009, FR-012a):
- Title: Non-empty, max 200 characters
- Description: Optional, max 2000 characters
- Completed: Boolean, defaults to False
- Timestamps: Stored in UTC for consistency

**State Transitions**:

```
[Incomplete] ←→ [Complete]
  ↓                     ↓
created_at         completed_at updated
updated_at         updated_at
```

- **Incomplete → Complete**: Set `completed = True`, update `completed_at` to current timestamp, update `updated_at`
- **Complete → Incomplete**: Set `completed = False`, set `completed_at = NULL`, update `updated_at`
- **Any Update**: Update `updated_at` to current timestamp

**SQLModel Definition**:

```python
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional

class Task(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", nullable=False, index=True)
    title: str = Field(max_length=200)
    description: Optional[str] = Field(default=None, max_length=2000)
    completed: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = Field(default=None)

    # Relationship to user (optional, for joined queries)
    user: User = Relationship(back_populates="tasks")
```

**Indexing**:
- `user_id`: Index (enforces fast ownership queries)
- `created_at`: Index (supports sorting by creation date)
- `(user_id, completed, created_at)`: Compound index (optimizes list query: user's tasks sorted by incomplete first, then created_at)

**Cascade Delete**: `ON DELETE CASCADE` on `user_id` foreign key (deleting a user deletes all tasks, per spec FR-017a)

---

## Relationships

### User → Tasks (One-to-Many)

**Description**: A user owns zero or more tasks. All tasks are strictly scoped to their owner.

**Directionality**:
- User side: `tasks: list[Task]` (optional, for eager loading)
- Task side: `user: User` (optional, for eager loading)

**Constraints**:
- **Mandatory**: Every task must have a `user_id` (no orphan tasks)
- **Cascade Delete**: Deleting a user deletes all associated tasks
- **No Sharing**: Tasks cannot be shared between users

**Foreign Key**:

```sql
ALTER TABLE tasks
ADD CONSTRAINT fk_task_user
FOREIGN KEY (user_id) REFERENCES users(id)
ON DELETE CASCADE;
```

---

## Schema SQL (DDL)

```sql
-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Index on email (for login queries)
CREATE UNIQUE INDEX idx_users_email ON users(email);

-- Tasks table
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description VARCHAR(2000),
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Indexes for task queries
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);
CREATE INDEX idx_tasks_user_completed_created ON tasks(user_id, completed, created_at);
```

---

## Pydantic Schemas (API Request/Response Models)

SQLModel automatically generates Pydantic schemas from table models. Below are the explicit schemas for API validation:

### User Schemas

#### UserRegister (Request)
```python
class UserRegister(SQLModel):
    email: str = Field(max_length=255, pattern="^[^@]+@[^@]+\.[^@]+$")
    password: str = Field(min_length=8)
```

#### UserLogin (Request)
```python
class UserLogin(SQLModel):
    email: str
    password: str
```

#### UserRead (Response)
```python
class UserRead(SQLModel):
    id: int
    email: str
    created_at: datetime
    # NOTE: password_hash is NOT exposed in API responses
```

---

### Task Schemas

#### TaskCreate (Request)
```python
class TaskCreate(SQLModel):
    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=2000)
```

#### TaskUpdate (Request)
```python
class TaskUpdate(SQLModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=2000)
```

#### TaskRead (Response)
```python
class TaskRead(SQLModel):
    id: int
    user_id: int
    title: str
    description: Optional[str]
    completed: bool
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime]
```

---

## Database Migration Strategy

### Tool: Alembic

Since SQLModel doesn't include built-in migrations, use Alembic (standard for SQLAlchemy/SQLModel).

### Initial Migration

```bash
# Generate initial migration from SQLModel models
alembic revision --autogenerate -m "Initial schema: users and tasks"

# Apply migration to database
alembic upgrade head
```

### Subsequent Migrations

1. Modify SQLModel models in `backend/src/models/`
2. Generate migration: `alembic revision --autogenerate -m "<description>"`
3. Review migration script in `alembic/versions/`
4. Apply migration: `alembic upgrade head`

### Rollback

```bash
# Rollback to previous migration
alembic downgrade -1

# Rollback to specific revision
alembic downgrade <revision_hash>
```

---

## Security Considerations

### Password Storage

- **Algorithm**: Argon2id (via `pwdlib` library)
- **Reasoning**: State-of-the-art password hashing, resistant to GPU attacks
- **Configuration**: Default `pwdlib.recommended()` uses Argon2id with safe defaults
- **Never store plain-text passwords**

### User Isolation

- **Enforced at Database Level**: `user_id` foreign key with NOT NULL constraint
- **Enforced at Application Level**: All queries filter by authenticated user's ID
- **Backend Responsibility**: JWT verification extracts `user_id`, all endpoints use `CurrentUserDep` dependency

### Data Integrity

- **Cascade Delete**: Tasks deleted when user deleted (no orphan tasks)
- **Foreign Keys**: Enforce referential integrity (users must exist to own tasks)
- **Indexes**: Optimize queries and enforce uniqueness (email)

---

## Performance Considerations

### Indexing Strategy

| Index | Query Pattern | Rationale |
|-------|---------------|-----------|
| `idx_users_email` | Login: `WHERE email = ?` | Unique index for fast lookup |
| `idx_tasks_user_id` | List tasks: `WHERE user_id = ?` | Fast filtering by user |
| `idx_tasks_created_at` | Sort tasks: `ORDER BY created_at` | Fast sorting |
| `idx_tasks_user_completed_created` | List sorted: `WHERE user_id = ? ORDER BY completed, created_at` | Compound index covers query |

### Query Optimization

**List Tasks Query** (most frequent):
```sql
SELECT * FROM tasks
WHERE user_id = ?
ORDER BY completed ASC, created_at ASC;
```

- Covered by compound index `idx_tasks_user_completed_created`
- Returns incomplete tasks first, then sorted by creation date (per spec FR-010a)

**Count Tasks Query** (for UI indicators):
```sql
SELECT COUNT(*) FROM tasks
WHERE user_id = ? AND completed = FALSE;
```

- Covered by `idx_tasks_user_id` or compound index

---

## Data Model Validation

### Compliance with Functional Requirements

| Requirement | Data Model Support |
|-------------|-------------------|
| FR-001 (Register users) | User table with email/password_hash |
| FR-002 (Email validation) | Email format validation at application level |
| FR-003 (Password min 8 chars) | Password min length at application level |
| FR-004 (Login) | User table enables authentication |
| FR-008 (Create tasks) | Task table with user_id foreign key |
| FR-009 (Non-empty title) | Task.title NOT NULL constraint |
| FR-010 (List user's tasks) | Task.user_id enables filtering |
| FR-010a (Sorting: incomplete first, by date) | Compound index `(user_id, completed, created_at)` |
| FR-011 (Update tasks) | Task table with title/description fields |
| FR-012 (Toggle completion) | Task.completed boolean + completed_at timestamp |
| FR-012a (Track completion timestamp) | Task.completed_at timestamp |
| FR-013 (Delete tasks) | Task table with primary key |
| FR-014 (User isolation) | Task.user_id foreign key enforces ownership |
| FR-015 (Persistence) | PostgreSQL database with ACID compliance |
| FR-016 (Task ownership) | Task.user_id foreign key |
| FR-017a (Cascade delete tasks) | `ON DELETE CASCADE` on user_id FK |
| FR-020 (Data consistency) | Transactions, foreign keys, indexes |

---

## Future Extensions (Out of Scope)

The following features are not in the initial scope but can be added later without breaking changes:

- **Task Categories/Tags**: Add `category` or `tags` JSONB field to Task table
- **Task Priorities**: Add `priority` enum (low, medium, high) to Task table
- **Task Due Dates**: Add `due_date` timestamp to Task table
- **Task Sharing**: Add `shared_with` junction table for multi-user task access
- **Subtasks**: Add `parent_task_id` self-referencing foreign key
- **Task History**: Add separate `task_history` table for audit trail

---

## Summary

The data model satisfies all functional requirements, enforces strict user isolation, and aligns with the project constitution. Key design decisions:

1. **Two entities**: User (identity) and Task (business data)
2. **One-to-Many relationship**: User → Tasks with cascade delete
3. **Strict isolation**: user_id foreign key ensures all tasks are owned
4. **Performance optimization**: Strategic indexing for common queries
5. **Security**: Argon2 password hashing, JWT-based authentication
6. **Extensibility**: Schema designed for future enhancements

---

**Phase 1 Status**: Complete ✅
**Next Phase**: Generate API Contracts (`/contracts/openapi.yaml`)
