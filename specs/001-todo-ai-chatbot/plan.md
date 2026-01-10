# Implementation Plan: Todo AI Chatbot

**Branch**: `1-todo-ai-chatbot` | **Date**: 2026-01-11 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-todo-ai-chatbot/spec.md`

## Summary

Build an AI-powered conversational interface for the existing Todo application, allowing users to manage tasks via natural language. The system uses OpenAI Agents SDK for AI reasoning, exposes task operations as MCP (Model Context Protocol) tools via the Official MCP SDK, and maintains stateless chat requests with persisted conversation history. The chatbot must integrate with the existing Phase II FastAPI backend and Next.js frontend while enforcing user data isolation.

## Technical Context

**Language/Version**: Python 3.11+ (Backend), Next JS 16, TypeScript 5.0+ (Frontend)
**Primary Dependencies**: FastAPI 0.104+, OpenAI Agents SDK, Official MCP SDK, SQLModel 0.0.14+
**Storage**: Neon Serverless PostgreSQL with SQLModel ORM
**Testing**: pytest (Backend), Jest + React Testing Library (Frontend)
**Target Platform**: Web application (Linux server for backend, browser for frontend)
**Project Type**: Web application with frontend + backend + MCP server
**Performance Goals**: Chat response under 5 seconds (SC-001), 95% first-attempt interpretation accuracy (SC-002)
**Constraints**: 1000 character max message length, token bucket rate limiting, stateless requests, Phase II functionality must remain intact
**Scale/Scope**: Single-tenant per user, concurrent sessions supported, conversation history persisted indefinitely

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Notes |
|------|--------|-------|
| Spec-Driven Development (Principle I) | ✅ PASS | Feature spec exists at `specs/001-todo-ai-chatbot/spec.md` |
| Authentication & Authorization (Principle II) | ✅ PASS | Reuses Phase II custom auth, JWT validation required |
| Task Ownership & Data Isolation (Principle III) | ✅ PASS | User isolation enforced via user_id filtering on all queries |
| Environment-Based Configuration (Principle IV) | ✅ PASS | API keys, secrets in environment variables |
| Clean Code Standards (Principle V) | ✅ PASS | PEP 8 for Python, TypeScript patterns for frontend |
| Monorepo Structure (Principle VI) | ✅ PASS | Following existing `frontend/` + `backend/` structure |
| Documentation & Traceability (Principle VII) | ✅ PASS | PHR and ADR will be created |
| Skills & Agents Usage (Principle VIII) | ✅ PASS | Will use `mcp-sdk`, `openai-agents-gemini`, `backend-auth-guardian`, `frontend-spec-implementer` |

## Project Structure

### Documentation (this feature)

```text
specs/001-todo-ai-chatbot/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (technology research)
├── data-model.md        # Phase 1 output (entity definitions)
├── quickstart.md        # Phase 1 output (development guide)
├── contracts/           # Phase 1 output (API specifications)
│   ├── chat-api.yaml    # Chat endpoint contract
│   └── mcp-tools.yaml   # MCP tool definitions
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/
│   │   ├── __init__.py
│   │   ├── task.py              # Existing Task model
│   │   ├── conversation.py      # NEW: Conversation model
│   │   └── message.py           # NEW: Message model
│   ├── api/
│   │   ├── __init__.py
│   │   ├── chat.py              # NEW: Chat endpoint
│   │   └── tasks.py             # Existing task endpoints
│   ├── services/
│   │   ├── __init__.py
│   │   └── chat_service.py      # NEW: Chat orchestration
│   ├── mcp/
│   │   ├── __init__.py
│   │   ├── tools.py             # MCP tool definitions (add_task, list_tasks, etc.)
│   │   └── server.py            # NEW: MCP server entry point (FastMCP)
│   └── core/
│       ├── __init__.py
│       ├── config.py            # Environment configuration
│       └── auth.py              # Authentication dependencies
├── tests/
│   ├── unit/
│   ├── integration/
│   └── conftest.py
└── pyproject.toml

frontend/
├── src/
│   ├── app/
│   │   ├── chat/                # NEW: Chat page
│   │   │   ├── page.tsx
│   │   │   └── ChatComponent.tsx
│   │   └── api/                 # Existing API routes
│   ├── components/
│   │   ├── chat/                # NEW: Chat components
│   │   │   ├── ChatMessage.tsx
│   │   │   ├── ChatInput.tsx
│   │   │   └── ConversationList.tsx
│   │   └── ui/                  # Existing UI components
│   └── lib/
│       ├── chat.ts              # NEW: Chat API client
│       └── auth.ts              # Existing auth utilities
└── tests/
    └── components/
        └── chat/
```

**Structure Decision**: The project extends the existing Phase II structure with:
- New database models in `backend/src/models/` (Conversation, Message)
- New chat API endpoint in `backend/src/api/chat.py`
- New MCP server integrated in `backend/src/mcp/` as part of the backend package
- New chat UI components in `frontend/src/components/chat/`
- The MCP server runs as a separate process via `python -m backend.src.mcp.server`, communicating with OpenAI Agent via direct function imports or stdio transport

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Separate chat service layer | Chat orchestration needs to handle conversation history, tool invocation, and response generation separately from API layer | Direct API handling would couple concerns and make testing harder |
| MCP server as subprocess | Standard MCP protocol requires separate process for proper tool discovery and execution | Direct in-process tools would not follow MCP specification standards |

## Phase 0: Research Required

Before proceeding to Phase 1 design, research is needed on:

1. **OpenAI Agents SDK patterns**: Best practices for agent creation, tool integration, and conversation handling
2. **MCP SDK server implementation**: How to expose Python functions as MCP tools properly
3. **Conversation context management**: Efficient patterns for storing and retrieving conversation history
4. **Rate limiting implementation**: Token bucket algorithm for FastAPI

## Phase 1: Design Artifacts

After research completion, the following will be generated:

- `research.md` - Technology decisions and patterns
- `data-model.md` - Entity definitions with SQLModel schemas
- `quickstart.md` - Development setup guide
- `contracts/chat-api.yaml` - OpenAPI specification for chat endpoint
- `contracts/mcp-tools.yaml` - MCP tool definitions
- Agent context updates via `update-agent-context.ps1`

## Phase 2: Tasks Generation

Run `/sp.tasks` after Phase 1 artifacts are complete to generate the implementation task list.
