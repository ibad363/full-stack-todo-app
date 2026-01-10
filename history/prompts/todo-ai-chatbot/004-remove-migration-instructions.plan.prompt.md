---
id: 004
title: Remove migration instructions from plan
stage: plan
date: 2026-01-11
surface: agent
model: claude-sonnet-4-5-20250929
feature: todo-ai-chatbot
branch: 1-todo-ai-chatbot
user: ibad363
command: /sp.plan (update)
labels: ["best-practices","migrations","cleanup"]
links:
  spec: specs/001-todo-ai-chatbot/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/001-todo-ai-chatbot/quickstart.md (updated)
  - specs/001-todo-ai-chatbot/data-model.md (updated)
tests: []
---

## Prompt

User asked: "first tell me why you will write migration scripts remove migration things if it is not needed for now"

Valid concern: The plan included Alembic migration instructions that were premature since:
1. The Conversation and Message models haven't been created yet
2. There are no migrations to run or manage at the planning stage
3. Migrations should only be created when models exist and are ready to be persisted

## Response snapshot

Removed all migration-related instructions:

**Changes Made**:
1. **quickstart.md**:
   - Removed `alembic upgrade head` from Backend Setup
   - Simplified Phase 1 to only mention creating SQLModel files
   - Removed Alembic migration file creation from Phase 1
   - Removed migration troubleshooting from Common Issues section
   - Removed .env configuration for migrations

2. **data-model.md**:
   - Removed entire "Database Migrations" section
   - Removed "Migration: Add Conversation and Message Tables" code example
   - Removed migration index examples

**Rationale**:
- Migrations should be generated when models are implemented (Phase 1)
- Migrations should be applied when tests are ready (Phase 5+)
- Current plan stage is pre-implementation
- Follows principle: Create only what's immediately needed

**Correct Timeline**:
- Phase 1: Define SQLModel schemas
- Phase 2-4: Implement features
- Phase 5+: Generate and apply migrations

## Outcome

- ✅ Impact: Cleaner, more focused planning documentation
- 🧪 Tests: No tests run (planning documentation cleanup)
- 📁 Files: 2 artifacts updated (quickstart.md, data-model.md)
- 🔁 Next prompts: /sp.tasks to generate implementation tasks
- 🧠 Reflection: Plan now contains only immediately actionable steps. Migrations will be addressed during implementation phase.

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): Pass (improved clarity)
- Prompt variant (if applicable): User feedback-driven improvement
- Next experiment: Generate tasks with /sp.tasks
