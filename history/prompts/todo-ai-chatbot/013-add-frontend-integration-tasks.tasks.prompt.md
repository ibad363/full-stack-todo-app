---
id: 013
title: Add frontend integration tasks
stage: tasks
date: 2026-01-13
surface: agent
model: claude-sonnet-4-5-20250929
feature: todo-ai-chatbot
branch: 1-todo-ai-chatbot
user: unknown
command: /sp.tasks you only create backend and didn't intergrate with frontend if yes so integrate with frontend also
labels: ["tasks","frontend","integration","chatbot"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - specs/001-todo-ai-chatbot/tasks.md
tests:
 - (not run)
---

## Prompt

you only create backend and didn't intergrate with frontend if yes so integrate with frontend also

## Response snapshot

- Identified that the chatbot backend exists (`backend/src/api/chat.py`, `backend/src/services/chat_service.py`, `backend/src/mcp/*`) but the frontend has no chat route/components.
- Noted a key integration requirement: frontend must obtain `user_id` for `POST /api/{user_id}/chat`; since there is no `/auth/me`, it must decode JWT `sub` from the `access_token` cookie.
- Rewrote `specs/001-todo-ai-chatbot/tasks.md` to add concrete frontend + integration tasks (chat page, components, API client method, route protection, navbar link), plus a short dependency/parallelization section.

## Outcome

- ✅ Impact: Task plan updated to include missing frontend integration work.
- 🧪 Tests: Not run (planning artifact only).
- 📁 Files: Updated specs/001-todo-ai-chatbot/tasks.md.
- 🔁 Next prompts: Implement tasks T001–T013 (MVP) starting with API client + chat page scaffolding.
- 🧠 Reflection: Keep contract alignment explicit (user_id type + response shape) to avoid integration drift.

## Evaluation notes (flywheel)

- Failure modes observed: Missing bash tooling in environment for PHR script; proceeded with template-based file creation.
- Graders run and results (PASS/FAIL): Not run.
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Add a minimal typed chat client in frontend and verify request/response against backend endpoint.