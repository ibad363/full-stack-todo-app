# Quickstart: Todo AI Chatbot Development

**Feature**: 001-todo-ai-chatbot
**Date**: 2026-01-11

## Prerequisites

- Python 3.11+
- Node.js 20+
- PostgreSQL (Neon Serverless)
- OpenAI API key
- Phase II codebase fully functional

## Installation

### Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
pip install -r requirements.txt

# Add new dependencies
pip install openai-agents mcp httpx slowapi

# Create .env file
cat > .env << EOF
DATABASE_URL=postgresql://user:password@localhost/todo_db
JWT_SECRET=your-secret-key-here
OPENAI_API_KEY=sk-your-openai-key-here
EOF

# Start backend
uvicorn src.main:app --reload
```

### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Create .env.local (if needed)
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:8000
EOF

# Start frontend
npm run dev
```

### MCP Server (Integrated in Backend)

No separate setup needed. The MCP server is integrated into the backend package at `backend/src/mcp/server.py`. It will be started as a subprocess during development.

## Project Layout

```
backend/
├── src/
│   ├── models/
│   │   ├── task.py           (existing)
│   │   ├── conversation.py   (NEW)
│   │   └── message.py        (NEW)
│   ├── api/
│   │   ├── tasks.py          (existing)
│   │   └── chat.py           (NEW)
│   ├── services/
│   │   ├── chat_service.py   (NEW)
│   │   └── __init__.py
│   ├── mcp/
│   │   ├── __init__.py
│   │   ├── tools.py          (NEW)
│   │   └── server.py         (NEW)
│   └── core/
│       ├── auth.py           (existing)
│       └── config.py         (existing)

frontend/
├── src/
│   ├── app/
│   │   ├── chat/             (NEW)
│   │   │   └── page.tsx
│   │   └── page.tsx          (existing)
│   └── components/
│       ├── chat/             (NEW)
│       │   ├── ChatMessage.tsx
│       │   ├── ChatInput.tsx
│       │   └── ConversationList.tsx
│       └── ui/               (existing)
```

## Implementation Phases

### Phase 1: Database Models (Day 1)

1. Create `Conversation` and `Message` models in `backend/src/models/`
2. Define SQLModel schemas for conversation history

**Files to Create**:
- `backend/src/models/conversation.py`
- `backend/src/models/message.py`

### Phase 2: MCP Server (Day 1-2)

1. Create MCP server at `backend/src/mcp/server.py`
2. Implement task tools in `backend/src/mcp/tools.py` using FastMCP
3. Test tools with MCP client

**Files to Create**:
- `backend/src/mcp/__init__.py`
- `backend/src/mcp/tools.py`
- `backend/src/mcp/server.py`

**Test**:
```bash
cd backend

# Start MCP server
python -m src.mcp.server

# In another terminal, test with MCP client
python -m mcp.client stdio -- python -m src.mcp.server
```

### Phase 3: Chat Service (Day 2)

1. Create `ChatService` class in `backend/src/services/chat_service.py`
2. Integrate OpenAI Agents SDK
3. Load MCP tools

**Files to Create**:
- `backend/src/services/chat_service.py`
- `backend/src/services/mcp_tools.py`

**Test**:
```python
from backend.src.services.chat_service import ChatService

service = ChatService()
response = await service.chat(user_id="user_123", message="Add task to buy milk")
print(response)
```

### Phase 4: Chat API Endpoint (Day 2-3)

1. Create `POST /api/{user_id}/chat` endpoint
2. Add request/response validation
3. Integrate authentication

**Files to Create**:
- `backend/src/api/chat.py`

**Test**:
```bash
curl -X POST http://localhost:8000/api/user_123/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Add task to buy groceries",
    "conversation_id": null
  }'
```

### Phase 5: Frontend Chat UI (Day 3-4)

1. Create chat page at `frontend/src/app/chat/`
2. Build chat components (message, input, history)
3. Integrate with chat API

**Files to Create**:
- `frontend/src/app/chat/page.tsx`
- `frontend/src/components/chat/ChatMessage.tsx`
- `frontend/src/components/chat/ChatInput.tsx`
- `frontend/src/components/chat/ConversationList.tsx`
- `frontend/src/lib/chat.ts`

### Phase 6: Testing & Documentation (Day 4-5)

1. Unit tests for services
2. Integration tests for API
3. E2E tests for UI
4. Documentation

## Key Code Patterns

### Model Definition

```python
# backend/src/models/conversation.py
from sqlmodel import SQLModel, Field
from datetime import datetime

class Conversation(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    user_id: str = Field(foreign_key="user.id", nullable=False, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
```

### OpenAI Agent Integration

```python
# backend/src/services/chat_service.py
from agents import Agent, Runner, function_tool

@function_tool
def add_task(title: str, description: str = "") -> dict:
    """Add a new task."""
    # Implementation
    return {"task_id": 1, "status": "created", "title": title}

agent = Agent(
    name="Todo Chatbot",
    instructions="Help users manage tasks.",
    tools=[add_task, list_tasks, complete_task, delete_task, update_task]
)

result = Runner.run_sync(agent, user_message)
```

### MCP Server Definition

```python
# backend/src/mcp/server.py
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("TodoChatbot")

@mcp.tool()
def add_task(user_id: str, title: str, description: str = "") -> dict:
    """Add a new task for a user."""
    # Implementation
    return {"task_id": 1, "status": "created", "title": title}

if __name__ == "__main__":
    mcp.run()
```

### API Endpoint

```python
# backend/src/api/chat.py
from fastapi import APIRouter, Depends, HTTPException
from backend.src.services.chat_service import ChatService

router = APIRouter()

@router.post("/{user_id}/chat")
async def chat(
    user_id: str,
    request: ChatRequest,
    current_user = Depends(get_current_user)
):
    """Chat with the todo bot."""
    if current_user.user_id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")

    service = ChatService()
    response = await service.chat(user_id, request.message, request.conversation_id)
    return response
```

## Environment Variables

### Backend

```bash
# .env
DATABASE_URL=postgresql://user:password@host/todo_db
JWT_SECRET=your-secret-key
OPENAI_API_KEY=sk-xxxx
RATE_LIMIT_CAPACITY=60
RATE_LIMIT_REFILL_RATE=1/minute
```


## Running the Full Stack

Terminal 1 - Backend:
```bash
cd backend
python -m uvicorn src.main:app --reload
```

Terminal 2 - MCP Server (as subprocess within backend):
```bash
cd backend
python -m src.mcp.server
```

Terminal 3 - Frontend:
```bash
cd frontend
npm run dev
```

## Testing

### Backend Tests

```bash
cd backend

# Run all tests
pytest

# Run specific test
pytest tests/test_chat_service.py

# With coverage
pytest --cov=src tests/
```

### Frontend Tests

```bash
cd frontend

# Run tests
npm test

# Watch mode
npm test -- --watch
```

## Common Issues & Solutions

### OpenAI API Rate Limits
- Implement exponential backoff in ChatService
- Use `max_retries` parameter in API calls

### MCP Server Startup Issues
- Ensure MCP server is started in separate terminal before chat requests
- Verify `backend/src/mcp/server.py` has proper module structure
- Check stdio transport is properly configured
- Verify tool signatures match expected inputs in `backend/src/mcp/tools.py`

### JWT Token Validation
- Ensure token is passed in Authorization header
- Verify JWT_SECRET matches between frontend and backend
- Check token expiration time

### Module Import Issues
- Ensure `backend/src/mcp/__init__.py` exists
- Verify import paths use `src.mcp` not `src/mcp`
- Run from backend directory when starting MCP server

## Next Steps

1. Run `/sp.tasks` to generate implementation tasks
2. Start Phase 1: Database Models
3. Follow the implementation phases in order
4. Test each phase before proceeding to the next

## Resources

- [OpenAI Agents Python SDK](https://github.com/openai/openai-agents-python)
- [MCP Python SDK](https://github.com/modelcontextprotocol/python-sdk)
- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [SQLModel Documentation](https://sqlmodel.tiangolo.com)
- [Next.js Documentation](https://nextjs.org)

## Support

For questions or issues:
1. Check the specification: `/specs/001-todo-ai-chatbot/spec.md`
2. Review the plan: `/specs/001-todo-ai-chatbot/plan.md`
3. Check the data model: `/specs/001-todo-ai-chatbot/data-model.md`
4. Review API contracts: `/specs/001-todo-ai-chatbot/contracts/`
