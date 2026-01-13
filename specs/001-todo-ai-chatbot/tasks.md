---
description: "Task list for feature implementation"
---

# Tasks: Todo AI Chatbot (Frontend + Backend Integration)

**Feature**: `001-todo-ai-chatbot`
**Branch**: `1-todo-ai-chatbot`
**Input**: Design documents from `/specs/001-todo-ai-chatbot/` (plan.md, spec.md, contracts/)

## Scope & Success Criteria

**Surface**: Integrate the existing chatbot backend (`backend/src/api/chat.py`, `backend/src/services/chat_service.py`, `backend/src/mcp/*`) with the Next.js frontend by adding a Chat UI and a typed Chat API client.

**Success =** an authenticated user can open a `/chat` page, send messages, receive responses, and have conversation continuity via `conversation_id`, while all actions remain scoped to the authenticated user.

### Constraints / Invariants

- Stateless chat requests: no server in-memory session state between requests (FR-013)
- Message length must be rejected over 1000 chars (FR-019)
- Token bucket rate limiting is enforced (FR-017)
- User isolation: user can only access their own tasks & conversations (FR-010)
- Reuse existing Phase II auth + task CRUD remains intact (FR-014, SC-007)

### Non-goals

- Voice, multi-language, rich chat formatting (per spec out-of-scope)
- New auth system changes beyond what’s needed to call the chat endpoint

---

## Part 1: Completed Backend Implementation

All backend tasks (Phase 1–7) are **completed**. These implement the core Chatbot API, MCP server, and database models.

### Phase 1: Setup & Infrastructure
- [x] T001 Install backend dependencies (FastAPI, SQLModel, openai-agents, mcp, slowapi) in `backend/requirements.txt`
- [x] T002 Install frontend dependencies (Next.js, React, TypeScript essentials) in `frontend/package.json`
- [x] T003 Create backend module structure: `backend/src/mcp/__init__.py`, `backend/src/models/__init__.py`, `backend/src/services/__init__.py`

### Phase 2: Foundational - Blocking Prerequisites
- [x] T004 Create `Conversation` model in `backend/src/models/conversation.py` with user_id, created_at, updated_at
- [x] T005 Create `Message` model in `backend/src/models/message.py` with conversation_id, user_id, role, content, created_at
- [x] T006 [P] Create MCP server entry point at `backend/src/mcp/server.py` using FastMCP
- [x] T007 [P] Create MCP tools module at `backend/src/mcp/tools.py` with placeholder function decorators for add_task, list_tasks, complete_task, delete_task, update_task
- [x] T008 Create `ChatService` class in `backend/src/services/chat_service.py` with async chat() method that accepts user_id, message, and optional conversation_id

### Phase 3: User Story 1 - Create Tasks via Conversation (P1)
- [x] T009 [US1] Implement `add_task` MCP tool in `backend/src/mcp/tools.py` that creates task via database
- [x] T010 [US1] Integrate OpenAI Agent with `add_task` tool in `backend/src/services/chat_service.py`
- [x] T011 [US1] Create `POST /api/{user_id}/chat` endpoint in `backend/src/api/chat.py` that calls ChatService and returns response

### Phase 4: User Story 2 - View Tasks via Conversation (P1)
- [x] T012 [US2] Implement `list_tasks` MCP tool in `backend/src/mcp/tools.py` with status filtering (all, pending, completed)
- [x] T013 [US2] Update OpenAI Agent instructions in `backend/src/services/chat_service.py` to handle list queries
- [x] T014 [US2] Add conversation history retrieval in `backend/src/services/chat_service.py` to populate chat context

### Phase 5: User Story 3 - Complete Tasks via Conversation (P1)
- [x] T015 [US3] Implement `complete_task` MCP tool in `backend/src/mcp/tools.py`
- [x] T016 [US3] Add task completion logic to OpenAI Agent instructions
- [x] T017 [US3] Store assistant response in Message table in `backend/src/services/chat_service.py`

### Phase 6: User Stories 4 & 5 - Delete and Update Tasks (P2)
- [x] T018 [P] [US4] Implement `delete_task` MCP tool in `backend/src/mcp/tools.py`
- [x] T019 [P] [US5] Implement `update_task` MCP tool in `backend/src/mcp/tools.py` with title and description updates
- [x] T020 [US4/US5] Add delete and update logic to OpenAI Agent instructions

### Phase 7: User Stories 6 & 7 + Polish
- [x] T021 [US6/US7] Implement user_id validation on all API endpoints in `backend/src/api/chat.py`
- [x] T022 [US6] Implement token bucket rate limiting middleware in `backend/src/core/middleware.py` with configurable limits

---

## Part 2: Frontend Integration Tasks (Pending)

**Purpose**: Connect the completed backend to the Next.js frontend UI.

### Phase 8: Frontend Setup & Alignment
- [x] T023 Confirm `frontend/.env.local` includes `NEXT_PUBLIC_API_URL` pointing to backend `/api` base (e.g., `http://localhost:8000/api`) (frontend/.env.local)
- [x] T024 Confirm backend CORS allows the frontend origin (localhost + prod) (backend/src/main.py)
- [x] T025 Align `user_id` type across backend and contracts (int vs string) by updating `specs/001-todo-ai-chatbot/contracts/chat-api.yaml`
- [x] T026 Align MCP tool schema constraints with existing Task model constraints (e.g., title/description max lengths) by updating `specs/001-todo-ai-chatbot/contracts/mcp-tools.yaml`
- [x] T027 Implement a frontend-safe way to obtain the current authenticated user id for chat calls (decode JWT `sub` from `access_token` cookie) in `frontend/src/lib/api.ts`
- [x] T028 Add Chat API method(s) to frontend client (e.g., `api.chatMessage(...)`) in `frontend/src/lib/api.ts` or a new `frontend/src/lib/chat.ts`

### Phase 9: Chat UI Implementation (MVP)
- [x] T029 [US1] Add `/chat` route and base page shell in `frontend/src/app/chat/page.tsx`
- [x] T030 [US1] Create chat UI container and message list component in `frontend/src/app/chat/ChatComponent.tsx`
- [x] T031 [US1] Create input component with submit + disabled/loading states in `frontend/src/components/chat/ChatInput.tsx`
- [x] T032 [US1] Create message bubble component (user vs assistant) in `frontend/src/components/chat/ChatMessage.tsx`
- [x] T033 [US1] Wire UI → Chat API call and append messages to local state in `frontend/src/app/chat/ChatComponent.tsx`
- [x] T034 [US1] Persist `conversation_id` client-side (React state + localStorage) so subsequent messages continue same conversation in `frontend/src/app/chat/ChatComponent.tsx`

### Phase 10: Advanced Chat Features (US2-US6)
- [x] T035 [US2] Ensure chat UI renders multi-line assistant responses cleanly (preserve newlines) in `frontend/src/components/chat/ChatMessage.tsx`
- [x] T036 [US2] Add a "Go to dashboard" affordance (link/button) near chat responses to cross-check tasks in `frontend/src/app/chat/page.tsx`
- [x] T037 [US3] Ensure chat UI supports task-id based commands ergonomically (e.g., placeholder text/help text) in `frontend/src/components/chat/ChatInput.tsx`
- [x] T038 [US4] Add a basic "Are you sure?" client-side confirmation flow for explicit delete commands (optional UX guard) in `frontend/src/app/chat/ChatComponent.tsx`
- [x] T039 [US5] Ensure update-related responses are clearly surfaced in chat history (no UI changes beyond rendering) in `frontend/src/components/chat/ChatMessage.tsx`
- [x] T040 [US6] Add lightweight client-side conversation resumption (restore conversation_id + in-memory transcript from localStorage) in `frontend/src/app/chat/ChatComponent.tsx`

### Phase 11: Security & Polish (US7 + Cross-cutting)
- [x] T041 [US7] Add `/chat` to route protection in `frontend/src/middleware.ts` matcher + auth checks
- [x] T042 [US7] Add "Chat" link to authenticated navbar so only logged-in users can reach it easily (frontend/src/components/dashboard/Navbar.tsx)
- [x] T043 Add loading + error UI for chat request failures (401/403/429/500) in `frontend/src/app/chat/ChatComponent.tsx`
- [x] T044 Enforce client-side message length <= 1000 before sending and show clear error (frontend/src/components/chat/ChatInput.tsx`

**All tasks completed!**

---

## Dependencies & Execution Order

### Phase Dependencies
- Part 1 (Backend) is **Done**.
- Part 2 (Frontend) tasks depend on Part 1 being complete.
- T023–T028 (Setup/Auth/API) block UI implementation.
- T029–T034 (MVP UI) block advanced features T035–T040.

### Parallel Opportunities
- After T028 (API Client):
  - Developer A: Chat UI components (T031, T032)
  - Developer B: Chat logic & state (T030, T033, T034)
  - Developer C: Route protection & Navbar (T041, T042)

---

## Suggested MVP Scope

MVP = Part 1 (Completed) + Phase 8 + Phase 9 + Phase 11 (Security):
- Backend logic is ready.
- Frontend needs API client + Basic Chat UI + Route Protection.
