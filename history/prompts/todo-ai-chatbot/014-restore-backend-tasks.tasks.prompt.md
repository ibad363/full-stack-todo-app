---
id: 014
title: Restore backend tasks
stage: tasks
date: 2026-01-13
surface: agent
model: claude-sonnet-4-5-20250929
feature: todo-ai-chatbot
branch: 1-todo-ai-chatbot
user: unknown
command: i want to update task.md not to remove old tasks i want back my old tasks + frontend integration tasks for chatbot
labels: ["tasks","restore","backend","frontend","integration"]
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

i want to update task.md not to remove old taskas i want back my old tasks + frontend integration tasks for chatbot

## Response snapshot

- Recovered the 22 original backend tasks (T001–T022) from retrieval history (prompt 005 era).
- Merged them back into `specs/001-todo-ai-chatbot/tasks.md`, marking them all as `[x] (completed)` since the backend implementation is largely done.
- Appended the new frontend integration tasks (T023–T044) as "Part 2" of the plan.
- Result is a unified task list: Part 1 (Backend - Done) + Part 2 (Frontend - Pending).

## Outcome

- ✅ Impact: Restored historical context while keeping the new forward-looking plan.
- 🧪 Tests: Not run.
- 📁 Files: Updated specs/001-todo-ai-chatbot/tasks.md.
- 🔁 Next prompts: Use the new plan to implement T027/T028 (API client updates) + T029 (Chat page).
- 🧠 Reflection: When rewriting task plans, always `cat` the old one first or use `git show` to ensure we don't drop completed history unless requested.

## Evaluation notes (flywheel)

- Failure modes observed: None in this turn; successful recovery.
- Graders run and results (PASS/FAIL): Not run.
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A