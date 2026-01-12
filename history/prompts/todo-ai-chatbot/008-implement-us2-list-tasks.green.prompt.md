---
id: 008
title: Implement US2 list tasks
stage: green
date: 2026-01-12
surface: agent
model: claude-sonnet-4-5-20250929
feature: todo-ai-chatbot
branch: 1-todo-ai-chatbot
user: unknown
command: /sp.implement
labels: ["us2","list-tasks","chat","mcp","gemini"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - D:\Ibad Coding\hackathon-2-todo\full-stack-todo-app-phase-3\backend\src\mcp\tools.py
 - D:\Ibad Coding\hackathon-2-todo\full-stack-todo-app-phase-3\backend\src\services\chat_service.py
 - D:\Ibad Coding\hackathon-2-todo\full-stack-todo-app-phase-3\specs\001-todo-ai-chatbot\tasks.md
tests:
 - pytest (backend)
---

## Prompt

Implement US2 list tasks via chat

## Response snapshot

- Implemented `list_tasks(user_id, status)` in `backend/src/mcp/tools.py` with status filtering (all/pending/completed) and user isolation.
- Added `get_tasks(status)` tool into the Gemini-backed agent in `backend/src/services/chat_service.py` and updated agent instructions to call it for list/show requests.
- Implemented conversation history injection into the agent prompt using the last 20 messages.
- Marked T012-T014 complete in `specs/001-todo-ai-chatbot/tasks.md`.
- Ran backend tests: `pytest` (PASS, 28 passed).

## Outcome

- ✅ Impact: Users can ask the chatbot to show/list tasks, and the agent can call a tool to retrieve tasks with basic filtering.
- 🧪 Tests: pytest PASS.
- 📁 Files: Updated MCP tools, chat orchestration, and tasks checklist.
- 🔁 Next prompts: Implement US3 complete_task tool + agent wiring (T015-T017).
- 🧠 Reflection: Keep tool interfaces consistent with the mcp-tools contract (structured output), and format human responses in ChatService.

## Evaluation notes (flywheel)

- Failure modes observed: None in tests; ensured no regression to existing task CRUD tests.
- Graders run and results (PASS/FAIL): pytest PASS
- Prompt variant (if applicable): none
- Next experiment (smallest change to try): Add explicit unit tests for chat tool behavior (chat endpoint) once response schema is finalized.
