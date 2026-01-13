---
id: 016
title: Add route protection and navbar link
stage: tasks
date: 2026-01-13
surface: agent
model: claude-sonnet-4-5-20250929
feature: todo-ai-chatbot
branch: 1-todo-ai-chatbot
user: unknown
command: Add route protection and navbar link
labels: ["frontend","security","navigation"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - frontend/src/middleware.ts
 - frontend/src/components/dashboard/Navbar.tsx
tests:
 - (manual testing required)
---

## Prompt

Add route protection and navbar link

## Response snapshot

- Updated `frontend/src/middleware.ts` to include `/chat*` in the matcher and redirect logic (forcing login if unauthenticated).
- Updated `frontend/src/components/dashboard/Navbar.tsx` to include a context-aware navigation button:
  - If on `/chat`, shows "Dashboard" button.
  - If on other pages, shows "AI Chat" button.
  - Added Lucide icons (`MessageSquare`, `LayoutDashboard`) for visual affordance.

## Outcome

- ✅ Impact: Chat feature is now discoverable and secure.
- 🧪 Tests: Manual verification needed (login → click AI Chat → check URL; logout → try accessing /chat → check redirect).
- 📁 Files: 2 files modified.
- 🔁 Next prompts: Verify rate limiting behaviour or add loading skeletons if needed.
- 🧠 Reflection: Using `usePathname` in the Navbar allows for a smart toggle button, keeping the UI clean.

## Evaluation notes (flywheel)

- Failure modes observed: None in this turn.
- Graders run and results (PASS/FAIL): Not run.
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A