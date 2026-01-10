# Data Model: Todo AI Chatbot

**Feature**: 001-todo-ai-chatbot
**Date**: 2026-01-11

## Entity Relationship Diagram

```text
User (existing)
    |
    | 1:N
    v
Conversation
    |
    | 1:N
    v
Message
```

## Database Models

### Conversation

Represents a chat session owned by a user. Used to group related messages.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | Integer | Primary Key, Auto-increment | Unique conversation identifier |
| `user_id` | String | Foreign Key (User.id), Not Null | Owner of the conversation |
| `created_at` | DateTime | Not Null, Default: now() | When conversation was created |
| `updated_at` | DateTime | Not Null, Default: now() | Last message timestamp |

**Relationships**:
- `user`: Many-to-One with User (each conversation belongs to one user)
- `messages`: One-to-Many with Message (ordered by created_at)

**SQLModel Definition**:
```python
class Conversation(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True, nullable=False)
    user_id: str = Field(foreign_key="user.id", nullable=False, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    messages: list["Message"] = Relationship(back_populates="conversation")
    user: "User" = Relationship(back_populates="conversations")
```

---

### Message

Represents a single message within a conversation. Messages are immutable once created.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | Integer | Primary Key, Auto-increment | Unique message identifier |
| `conversation_id` | Integer | Foreign Key (Conversation.id), Not Null | Parent conversation |
| `user_id` | String | Foreign Key (User.id), Not Null | Message author |
| `role` | String | Not Null, Check: IN ('user', 'assistant') | Message sender type |
| `content` | String | Not Null, Max: 1000 chars | Message text content |
| `created_at` | DateTime | Not Null, Default: now() | When message was sent |

**Validation Rules**:
- `content` must not be empty or whitespace-only
- `content` maximum 1000 characters (FR-019)
- `role` must be either 'user' or 'assistant'

**Relationships**:
- `conversation`: Many-to-One with Conversation
- `user`: Many-to-One with User

**SQLModel Definition**:
```python
class Message(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True, nullable=False)
    conversation_id: int = Field(
        foreign_key="conversation.id", nullable=False, index=True
    )
    user_id: str = Field(foreign_key="user.id", nullable=False, index=True)
    role: str = Field(nullable=False, max_length=20)  # "user" | "assistant"
    content: str = Field(nullable=False, max_length=1000)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    conversation: "Conversation" = Relationship(back_populates="messages")
    user: "User" = Relationship(back_populates="messages")
```

**Indexes**:
- `(conversation_id, created_at)` - For fetching conversation history in order
- `(user_id, created_at)` - For user's recent conversations query

---

### Task (Existing - Updated)

Existing Phase II model. No schema changes required for Phase III.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | Integer | Primary Key, Auto-increment | Unique task identifier |
| `user_id` | String | Foreign Key (User.id), Not Null | Owner of the task |
| `title` | String | Not Null, Max: 255 chars | Task title |
| `description` | String | Nullable, Max: 4000 chars | Task details |
| `completed` | Boolean | Not Null, Default: False | Completion status |
| `created_at` | DateTime | Not Null, Default: now() | When task was created |
| `updated_at` | DateTime | Not Null, Default: now() | Last modification timestamp |

**SQLModel Definition** (existing):
```python
class Task(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True, nullable=False)
    user_id: str = Field(foreign_key="user.id", nullable=False, index=True)
    title: str = Field(nullable=False, max_length=255)
    description: str | None = Field(default=None, max_length=4000)
    completed: bool = Field(default=False, nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    user: "User" = Relationship(back_populates="tasks")
```

---

## MCP Tool Schemas

### add_task

Create a new task for a user.

**Input Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | Yes | User identifier |
| `title` | string | Yes | Task title (max 255 chars) |
| `description` | string | No | Task description (max 4000 chars) |

**Output**:
```python
{
    "task_id": int,
    "status": "created",
    "title": string
}
```

---

### list_tasks

Retrieve tasks for a user.

**Input Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | Yes | User identifier |
| `status` | string | No | Filter: "all" (default), "pending", "completed" |

**Output**:
```python
[
    {
        "task_id": int,
        "title": string,
        "description": string | null,
        "completed": boolean,
        "created_at": datetime
    }
]
```

---

### complete_task

Mark a task as completed.

**Input Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | Yes | User identifier |
| `task_id` | integer | Yes | Task identifier |

**Output**:
```python
{
    "task_id": int,
    "status": "completed",
    "title": string
}
```

---

### delete_task

Delete a task.

**Input Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | Yes | User identifier |
| `task_id` | integer | Yes | Task identifier |

**Output**:
```python
{
    "task_id": int,
    "status": "deleted",
    "title": string
}
```

---

### update_task

Update task title and/or description.

**Input Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | Yes | User identifier |
| `task_id` | integer | Yes | Task identifier |
| `title` | string | No | New title (max 255 chars) |
| `description` | string | No | New description (max 4000 chars) |

**Output**:
```python
{
    "task_id": int,
    "status": "updated",
    "title": string
}
```

---

## API Request/Response Schemas

### Chat Request

```python
class ChatRequest(BaseModel):
    conversation_id: int | None = Field(None, description="Existing conversation ID")
    message: str = Field(..., min_length=1, max_length=1000, description="User message")

    model_config = {
        "json_schema_extra": {
            "example": {
                "conversation_id": 123,
                "message": "Add a task to buy groceries"
            }
        }
    }
```

### Chat Response

```python
class ChatResponse(BaseModel):
    conversation_id: int = Field(..., description="Conversation identifier")
    response: str = Field(..., description="Assistant response")
    tool_calls: list[dict] = Field(default_factory=list, description="MCP tools invoked")

    model_config = {
        "json_schema_extra": {
            "example": {
                "conversation_id": 123,
                "response": "I've added 'buy groceries' to your tasks.",
                "tool_calls": [
                    {"tool": "add_task", "status": "success", "task_id": 456}
                ]
            }
        }
    }
```

---

## Constraints and Relationships

### Foreign Key Constraints

| Child Table | Parent Table | Constraint | On Delete |
|-------------|--------------|------------|-----------|
| `conversation` | `user` | `fk_conversation_user_id` | CASCADE |
| `message` | `conversation` | `fk_message_conversation_id` | CASCADE |
| `message` | `user` | `fk_message_user_id` | CASCADE |

**Note**: Setting CASCADE on delete ensures that:
- Deleting a user deletes all their conversations and messages
- Deleting a conversation deletes all its messages

### Check Constraints

```python
# Message role must be 'user' or 'assistant'
op.create_check_constraint(
    'ck_message_role_valid',
    'message',
    "role IN ('user', 'assistant')"
)
```

---

## Performance Considerations

### Indexes

| Table | Index Columns | Purpose |
|-------|---------------|---------|
| `conversation` | `user_id` | Filter user's conversations |
| `conversation` | `user_id, updated_at` | Recent conversations order |
| `message` | `conversation_id` | Fetch messages by conversation |
| `message` | `user_id` | User's message history |
| `message` | `conversation_id, created_at` | Conversation history ordered |

### Query Patterns

**Frequently Used**:
1. `SELECT * FROM conversation WHERE user_id = ? ORDER BY updated_at DESC`
2. `SELECT * FROM message WHERE conversation_id = ? ORDER BY created_at ASC`
3. `INSERT INTO message (...) VALUES (...)`
4. `UPDATE conversation SET updated_at = ? WHERE id = ?`

**Optimized By**:
- Index on `conversation(user_id, updated_at DESC)`
- Index on `message(conversation_id, created_at ASC)`
- `updated_at` auto-update on conversation when new message added

---

## Sample Data

### Conversation
| id | user_id | created_at | updated_at |
|----|---------|------------|------------|
| 1 | user_abc123 | 2026-01-11 10:00:00 | 2026-01-11 10:05:00 |

### Messages
| id | conversation_id | user_id | role | content | created_at |
|----|-----------------|---------|------|---------|------------|
| 1 | 1 | user_abc123 | user | Add task to buy groceries | 2026-01-11 10:00:00 |
| 2 | 1 | user_abc123 | assistant | I've added 'buy groceries' to your tasks. | 2026-01-11 10:00:01 |
| 3 | 1 | user_abc123 | user | What else do I have? | 2026-01-11 10:05:00 |
| 4 | 1 | user_abc123 | assistant | You have 1 pending task: buy groceries | 2026-01-11 10:05:01 |
