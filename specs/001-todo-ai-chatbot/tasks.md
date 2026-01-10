# Implementation Tasks: Todo AI Chatbot

**Feature**: 001-todo-ai-chatbot
**Branch**: `1-todo-ai-chatbot`
**Date**: 2026-01-11
**Status**: Ready for Implementation

## Task Overview

**Total Tasks**: 22
**User Stories**: 7 (3 P1, 2 P2, 2 Foundation)
**Phases**: 6 (Setup + Foundational + 4 User Stories + Polish)

| Phase | Tasks | Focus |
|-------|-------|-------|
| Phase 1: Setup | T001-T003 | Project initialization |
| Phase 2: Foundational | T004-T008 | Blocking prerequisites |
| Phase 3: US1 (Create) | T009-T011 | Task creation via chat |
| Phase 4: US2 (View) | T012-T014 | Task viewing via chat |
| Phase 5: US3 (Complete) | T015-T017 | Task completion via chat |
| Phase 6: US4-US5 (Delete/Update) | T018-T020 | Task deletion and updates |
| Phase 7: US6-US7 & Polish | T021-T022 | History + isolation + Polish |

---

## Phase 1: Setup & Infrastructure

### Phase Goals
Initialize project dependencies, create module structure, and prepare development environment.

### Independent Test Criteria
- Backend can start without errors: `uvicorn src.main:app --reload`
- Frontend can start without errors: `npm run dev`
- All required packages are installed

---

- [ ] T001 Install backend dependencies (FastAPI, SQLModel, openai-agents, mcp, slowapi) in `backend/requirements.txt`
- [ ] T002 Install frontend dependencies (Next.js, React, TypeScript essentials) in `frontend/package.json`
- [ ] T003 Create backend module structure: `backend/src/mcp/__init__.py`, `backend/src/models/__init__.py`, `backend/src/services/__init__.py`

---

## Phase 2: Foundational - Blocking Prerequisites

### Phase Goals
Implement shared infrastructure that blocks all user stories.

### Independent Test Criteria
- Database models exist and are importable
- Chat API endpoint is defined (even if not fully functional)
- MCP server can start without errors
- OpenAI Agent can be instantiated
- Rate limiting middleware is integrated

---

### Models & Data Layer

- [ ] T004 Create `Conversation` model in `backend/src/models/conversation.py` with user_id, created_at, updated_at
- [ ] T005 Create `Message` model in `backend/src/models/message.py` with conversation_id, user_id, role, content, created_at

### MCP Server Foundation

- [ ] T006 [P] Create MCP server entry point at `backend/src/mcp/server.py` using FastMCP
- [ ] T007 [P] Create MCP tools module at `backend/src/mcp/tools.py` with placeholder function decorators for add_task, list_tasks, complete_task, delete_task, update_task

### Chat Service & API Foundation

- [ ] T008 Create `ChatService` class in `backend/src/services/chat_service.py` with async chat() method that accepts user_id, message, and optional conversation_id

---

## Phase 3: User Story 1 - Create Tasks via Conversation (P1)

### Story Goal
Users can create new tasks by sending natural language messages to the chatbot.

### User Story Mapping
- **User Story**: Create Tasks via Conversation
- **Acceptance**: User sends "Add a task to buy groceries" → task is created and assistant confirms
- **MCP Tool**: `add_task`

### Independent Test Criteria
- Send chat message "Add task to buy milk"
- Verify task is created in database
- Verify assistant response confirms creation
- Verify task belongs to authenticated user
- Verify unauthenticated request is rejected

---

- [ ] T009 [US1] Implement `add_task` MCP tool in `backend/src/mcp/tools.py` that creates task via database
- [ ] T010 [US1] Integrate OpenAI Agent with `add_task` tool in `backend/src/services/chat_service.py`
- [ ] T011 [US1] Create `POST /api/{user_id}/chat` endpoint in `backend/src/api/chat.py` that calls ChatService and returns response

---

## Phase 4: User Story 2 - View Tasks via Conversation (P1)

### Story Goal
Users can view their tasks using natural language queries like "Show me all my tasks" or "What's pending?"

### User Story Mapping
- **User Story**: View Tasks via Conversation
- **Acceptance**: User sends "Show me all my tasks" → all tasks are returned with details
- **MCP Tool**: `list_tasks`

### Independent Test Criteria
- Send "What are my tasks?"
- Verify all user's tasks are returned
- Verify non-user's tasks are not returned
- Verify completion status is included
- Verify filtering works (pending/completed)

---

- [ ] T012 [US2] Implement `list_tasks` MCP tool in `backend/src/mcp/tools.py` with status filtering (all, pending, completed)
- [ ] T013 [US2] Update OpenAI Agent instructions in `backend/src/services/chat_service.py` to handle list queries
- [ ] T014 [US2] Add conversation history retrieval in `backend/src/services/chat_service.py` to populate chat context

---

## Phase 5: User Story 3 - Complete Tasks via Conversation (P1)

### Story Goal
Users can mark tasks as complete using natural language like "Mark task 3 as done"

### User Story Mapping
- **User Story**: Complete Tasks via Conversation
- **Acceptance**: User sends "Mark task 3 as complete" → task marked complete and assistant confirms
- **MCP Tool**: `complete_task`

### Independent Test Criteria
- Send "Mark task 5 as complete"
- Verify task.completed = true
- Verify assistant confirms
- Verify non-owner cannot complete task
- Verify cannot complete non-existent task

---

- [ ] T015 [US3] Implement `complete_task` MCP tool in `backend/src/mcp/tools.py`
- [ ] T016 [US3] Add task completion logic to OpenAI Agent instructions
- [ ] T017 [US3] Store assistant response in Message table in `backend/src/services/chat_service.py`

---

## Phase 6: User Stories 4 & 5 - Delete and Update Tasks (P2)

### Story Goals
- **US4**: Delete tasks via natural language
- **US5**: Update task details via natural language

### User Story Mapping
- **US4**: Delete Tasks via Conversation
- **US5**: Update Tasks via Conversation
- **MCP Tools**: `delete_task`, `update_task`

### Independent Test Criteria (Both Stories)
- Delete: Send "Delete task 5" → task removed and assistant confirms
- Update: Send "Change task 1 to 'New title'" → task updated and assistant confirms
- Both respect user isolation
- Both handle non-existent tasks gracefully

---

- [ ] T018 [P] [US4] Implement `delete_task` MCP tool in `backend/src/mcp/tools.py`
- [ ] T019 [P] [US5] Implement `update_task` MCP tool in `backend/src/mcp/tools.py` with title and description updates
- [ ] T020 [US4/US5] Add delete and update logic to OpenAI Agent instructions

---

## Phase 7: User Stories 6 & 7 + Polish

### Story Goals
- **US6**: Maintain conversation context across sessions
- **US7**: Enforce user data isolation

### User Story Mapping
- **US6**: Maintain Conversation Context
- **US7**: User Data Isolation
- **Foundation**: Rate limiting, error handling, validation

### Independent Test Criteria (US6)
- Send multiple messages in conversation
- Retrieve conversation by ID
- Verify assistant remembers context
- Verify history is persisted

### Independent Test Criteria (US7)
- User A cannot view User B's tasks
- User A cannot complete User B's tasks
- Unauthenticated requests are rejected
- User_id validation enforced on all operations

---

- [ ] T021 [US6/US7] Implement user_id validation on all API endpoints in `backend/src/api/chat.py`
- [ ] T022 [US6] Implement token bucket rate limiting middleware in `backend/src/core/middleware.py` with configurable limits

---

## Dependencies & Execution Order

### Critical Path (Must Complete Sequentially)
1. **Phase 1** (Setup) → All phases
2. **Phase 2** (Foundational) → All user story phases
3. **Phase 3** (US1 Create) → Enables Phase 4-5 testing
4. **Phase 4** (US2 View) → Recommended before Phase 5
5. **Phase 5** (US3 Complete) → Independent
6. **Phase 6** (US4/US5 Delete/Update) → Independent
7. **Phase 7** (US6/US7) → Final layer

### Parallelizable Tasks
- **T006 + T007**: Both MCP components can be written in parallel
- **T018 + T019**: Delete and Update tools can be written in parallel
- **Phase 6 tasks** can start once Phase 2 is complete

### Suggested Execution
```
Phase 1: T001, T002, T003 (sequential, ~30 min)
Phase 2: T004-T005, then T006+T007 parallel, then T008 (seq, ~1-2 hours)
Phase 3: T009, T010, T011 (sequential, ~1 hour)
Phase 4: T012, T013, T014 (sequential, ~1 hour)
Phase 5: T015, T016, T017 (sequential, ~1 hour)
Phase 6: T018+T019 parallel, then T020 (seq, ~1 hour)
Phase 7: T021, T022 (sequential, ~1 hour)

Estimated Total: 6-8 hours
```

---

## Minimum Viable Product (MVP) Scope

### MVP = Phase 1 + Phase 2 + Phase 3

**Deliverables**:
- Users can send chat message "Add task to..."
- Task is created and stored
- Assistant confirms creation
- Full auth and user isolation

**Benefits**:
- Demonstrates core value (create tasks conversationally)
- Enables end-to-end testing
- Can be extended with other operations

**Time**: ~2 hours

---

## Implementation Strategy

### Architecture Pattern
```
Chat Request
    ↓
[Authentication Check]
    ↓
[Retrieve Conversation History]
    ↓
[OpenAI Agent w/ MCP Tools]
    ↓
[Tool Execution] → [MCP Tool]
                      ↓
                 [Database Operation]
                      ↓
[Store Response in Message Table]
    ↓
[Return to User]
```

### Key Principles
1. **Stateless Requests**: No in-memory state between requests
2. **User Isolation**: Every query filters by authenticated user_id
3. **Graceful Degradation**: OpenAI failures return friendly message
4. **Rate Limiting**: Token bucket per user
5. **Immutable History**: Messages never updated, only created

### Code Organization
- **Models**: Data structures (Conversation, Message)
- **MCP Tools**: Individual task operations (add_task, list_tasks, etc.)
- **ChatService**: Orchestration layer (agent + tool invocation + history)
- **API Layer**: HTTP endpoints (authentication + validation)

---

## Acceptance Criteria Template

For each task, verify:
- [ ] Code follows PEP 8 (Python) / ESLint (TypeScript)
- [ ] No hardcoded secrets or API keys
- [ ] Appropriate error handling
- [ ] User isolation enforced (where applicable)
- [ ] Code is documented with docstrings

---

## Risk Areas & Mitigations

| Risk | Mitigation |
|------|-----------|
| OpenAI API unavailable | Graceful degradation with fallback message |
| Rate limit exceeded | Token bucket limiting + user-friendly error |
| Long message handling | Reject >1000 chars with clear error |
| Concurrent task edits | Last-write-wins strategy |
| User data leakage | Validate user_id on every query |

---

## Next Steps

1. Start with Phase 1 (Setup) - 30 minutes
2. Complete Phase 2 (Foundational) - 1-2 hours
3. Build Phase 3 (MVP) - 1 hour
4. Test end-to-end
5. Continue with remaining phases

**Recommended MVP Completion Target**: Same day as Phase 2
