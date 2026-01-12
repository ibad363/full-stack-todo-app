---
id: 006
title: Switch to Gemini and update tasks
stage: misc
date: 2026-01-12
surface: agent
model: claude-sonnet-4-5-20250929
feature: todo-ai-chatbot
branch: 1-todo-ai-chatbot
user: unknown
command: /sp.implement
labels: ["phase-3","gemini","tasks-md","implementation"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - D:\Ibad Coding\hackathon-2-todo\full-stack-todo-app-phase-3\backend\requirements.txt
 - D:\Ibad Coding\hackathon-2-todo\full-stack-todo-app-phase-3\backend\src\core\config.py
 - D:\Ibad Coding\hackathon-2-todo\full-stack-todo-app-phase-3\backend\src\models\conversation.py
 - D:\Ibad Coding\hackathon-2-todo\full-stack-todo-app-phase-3\backend\src\models\message.py
 - D:\Ibad Coding\hackathon-2-todo\full-stack-todo-app-phase-3\backend\src\mcp\server.py
 - D:\Ibad Coding\hackathon-2-todo\full-stack-todo-app-phase-3\backend\src\mcp\tools.py
 - D:\Ibad Coding\hackathon-2-todo\full-stack-todo-app-phase-3\specs\001-todo-ai-chatbot\tasks.md
tests:
 - (not run)
---

## Prompt

when you complete some tasks update tasks.md time to
and why you have used open ai api paid key, i want to do with gemini model

## Response snapshot

- Marked completed items in `specs/001-todo-ai-chatbot/tasks.md` for T001-T007.
- Removed time estimates from `tasks.md` ("~30 min", "~1 hour", and "Estimated Total: 6-8 hours"), and changed MVP time to "TBD".
- Switched backend settings from `OPENAI_API_KEY/OPENAI_MODEL` to `GEMINI_API_KEY/GEMINI_MODEL` in `backend/src/core/config.py`.
- Confirmed `backend/.env` currently does not contain any OpenAI key.

## Outcome

- ✅ Impact: Tasks progress is reflected in tasks.md; backend config aligns with Gemini preference.
- 🧪 Tests: Not run.
- 📁 Files: Updated deps/config/spec tasks checklist; created Conversation/Message models and MCP skeleton.
- 🔁 Next prompts: Implement `ChatService` (T008) and then US1 tools + API.
- 🧠 Reflection: Avoid introducing OpenAI-specific env vars when plan specifies Gemini; keep tasks.md free of time estimates.

## Evaluation notes (flywheel)

- Failure modes observed: Initially used OpenAI naming defaults; corrected to Gemini settings.
- Graders run and results (PASS/FAIL): Not run.
- Prompt variant (if applicable): none
- Next experiment (smallest change to try): Implement Gemini client adapter in ChatService following skill reference.
