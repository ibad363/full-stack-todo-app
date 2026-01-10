# Research: Todo AI Chatbot

**Feature**: 001-todo-ai-chatbot
**Date**: 2026-01-11

## Technology Decisions

### 1. OpenAI Agents SDK

**Decision**: Use `openai-agents` Python package with `Runner.run_sync()` for synchronous chat requests.

**Rationale**:
- Native Python SDK with excellent type safety and documentation
- `@function_tool` decorator provides clean tool definition pattern
- Built-in `SQLiteSession` for conversation history (alternatives: custom session, vector storage)
- Supports structured output via Pydantic models
- Compatible with existing Python backend

**Implementation Pattern**:
```python
from agents import Agent, Runner, function_tool

@function_tool
def add_task(title: str, description: str = "") -> dict:
    """Add a new task to the todo list."""
    # Implementation
    return {"task_id": 1, "title": title, "status": "created"}

agent = Agent(
    name="Todo Chatbot",
    instructions="Help users manage tasks via natural language.",
    tools=[add_task, list_tasks, complete_task, delete_task, update_task],
)

result = Runner.run_sync(agent, user_message)
print(result.final_output)
```

**Error Handling**:
- Wrap `Runner.run()` in try/except for `AgentsException`
- Handle `MaxTurnsExceeded` for infinite loops
- Return graceful degradation messages on API failures

### 2. MCP Server Implementation

**Decision**: Use `FastMCP` (high-level API from Official MCP SDK) with stdio transport for simplicity.

**Rationale**:
- FastMCP provides decorator-based tool definitions (cleaner than low-level)
- Stdio transport is simplest for process-based MCP communication
- FastMCP supports both stdio and HTTP transports if needed later
- Official SDK ensures compatibility with OpenAI's MCP integration

**Implementation Pattern**:
```python
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("TodoChatbot")

@mcp.tool()
def add_task(user_id: str, title: str, description: str = "") -> dict:
    """Add a new task for a user."""
    return {"task_id": 1, "title": title, "status": "created"}

if __name__ == "__main__":
    mcp.run()  # Uses stdio transport by default
```

**Alternative Considered**: Low-level Server API
- More control but requires more boilerplate
- Rejected because FastMCP provides sufficient flexibility

### 3. MCP Tool Integration with OpenAI Agent

**Decision**: Run MCP server as a separate process; agent communicates via MCP transport.

**Rationale**:
- Standard pattern for MCP deployment
- Separation of concerns: MCP server handles database operations
- Allows independent scaling of agent and tool layers

**Implementation**:
```python
# Option 1: Direct function imports (simpler, same process)
from mcp_server.tools import add_task, list_tasks

agent = Agent(tools=[add_task, list_tasks])

# Option 2: MCP transport (standard MCP protocol)
# Agent uses MCPClient to communicate with external MCP server
```

**Recommendation**: Use Option 1 for initial implementation (direct imports).
Switch to Option 2 (MCP transport) only if:
- MCP server needs to scale independently
- Multiple agents share the same MCP tools

### 4. Conversation History Storage

**Decision**: Store conversation history in PostgreSQL database using SQLModel.

**Rationale**:
- Already using PostgreSQL + SQLModel for tasks
- Natural fit for relational conversation data
- Enables queries like "show all conversations for user"
- Consistent with existing Phase II patterns

**Schema**:
```python
class Conversation(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    user_id: str = Field(foreign_key="user.id", nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class Message(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    conversation_id: int = Field(foreign_key="conversation.id", nullable=False)
    user_id: str = Field(foreign_key="user.id", nullable=False)
    role: str = Field(nullable=False)  # "user" | "assistant"
    content: str = Field(nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
```

**Alternatives Considered**:
- SQLiteSession (from Agents SDK) - rejected because PostgreSQL provides better query capabilities
- Vector storage for semantic search - rejected (overkill for this use case)

### 5. Rate Limiting

**Decision**: Implement token bucket rate limiting in FastAPI middleware.

**Rationale**:
- Token bucket allows burst traffic (natural for conversational interfaces)
- Configurable limits per user
- Simple to implement with Redis or in-memory storage

**Implementation Pattern**:
```python
from fastapi import Request, HTTPException
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.post("/api/{user_id}/chat")
@limiter.limit("60/minute")  # Token bucket equivalent
async def chat_endpoint(request: Request, user_id: str, body: ChatRequest):
    # Handle chat request
    pass
```

### 6. Authentication Integration

**Decision**: Reuse existing Phase II JWT authentication; validate user_id matches token.

**Rationale**:
- Constitution Principle II: Reuse existing auth system
- JWT token contains user_id; validate it matches path parameter
- Ensures users can only access their own data

**Implementation**:
```python
from fastapi import Depends, HTTPException
from backend.core.auth import verify_token

async def get_current_user(user_id: str = Path(...),
                          token: str = Depends(verify_token)):
    if token.user_id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    return token.user_id
```

## Best Practices Summary

### OpenAI Agents SDK
- Use `@function_tool` decorator for all tool functions
- Return structured dicts from tools for consistent parsing
- Set `max_turns` to prevent infinite loops
- Handle `AgentsException` for graceful error recovery

### MCP Server
- Use FastMCP for cleaner code
- Provide clear docstrings for each tool
- Return descriptive error messages
- Validate inputs before database operations

### Chat API
- Validate message length (<1000 chars) before processing
- Store user message before agent processing
- Store assistant response after processing
- Return conversation_id in all responses

## Alternatives Considered

| Decision | Alternative | Why Rejected |
|----------|-------------|--------------|
| OpenAI Agents SDK | LangChain Agents | OpenAI SDK is simpler, better docs |
| FastMCP | Low-level Server API | FastMCP reduces boilerplate |
| PostgreSQL | SQLiteSession | PostgreSQL enables queries |
| Token bucket | Fixed window | Token bucket allows bursts |
| Integrated MCP in backend folder | Standalone mcp-server | Better code organization, single Python project |
| Separate MCP process | In-process tools | MCP protocol standard, proper tool discovery |

## Implementation Notes

1. **MCP Server Location**: Integrated at `backend/src/mcp/server.py` as part of backend package
2. **Tool Function Signatures**: Must match MCP tool schema exactly in `backend/src/mcp/tools.py`
3. **Error Messages**: Should be user-friendly, not technical
4. **Response Time**: Target <5 seconds for chat responses
5. **Testing**: Mock OpenAI API calls in unit tests; test MCP server with `python -m mcp.client stdio`
6. **Subprocess Management**: MCP server runs as separate Python process started via `python -m src.mcp.server`

## References

- [OpenAI Agents Python SDK](https://github.com/openai/openai-agents-python)
- [MCP Python SDK](https://github.com/modelcontextprotocol/python-sdk)
- [FastMCP Documentation](https://modelcontextprotocol.io/docs/concepts/server)
