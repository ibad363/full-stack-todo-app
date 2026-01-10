---
id: 003
title: Integrate MCP server into backend
stage: plan
date: 2026-01-11
surface: agent
model: claude-sonnet-4-5-20250929
feature: todo-ai-chatbot
branch: 1-todo-ai-chatbot
user: ibad363
command: /sp.plan (update)
labels: ["architecture","mcp","structure","refactoring"]
links:
  spec: specs/001-todo-ai-chatbot/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/001-todo-ai-chatbot/plan.md (updated)
  - specs/001-todo-ai-chatbot/research.md (updated)
  - specs/001-todo-ai-chatbot/quickstart.md (updated)
tests: []
---

## Prompt

User requested: "i want mcp server in backend folder not stand alone update this"

This requested moving the MCP server from a standalone `mcp-server/` directory to being integrated into the `backend/src/mcp/` folder as part of the main backend package.

## Response snapshot

Updated all planning artifacts to reflect MCP server integration:

**Changes Made**:
1. **plan.md**: Updated project structure to show MCP server in `backend/src/mcp/` instead of standalone `mcp-server/`
2. **research.md**: Updated alternatives considered to note standalone vs. integrated decision
3. **quickstart.md**: Updated all references to MCP server setup, project layout, phases, running instructions
4. **Complexity Tracking**: Removed standalone MCP server as a complexity violation since it's now integrated

**Project Structure Update**:
- Old: `mcp-server/src/tools.py`, `mcp-server/src/server.py`, `mcp-server/pyproject.toml`
- New: `backend/src/mcp/tools.py`, `backend/src/mcp/server.py` (shared backend pyproject.toml)

**Startup Changes**:
- Old: Separate terminal running `python mcp-server/src/server.py`
- New: Separate terminal running `python -m src.mcp.server` from backend directory

**Benefits**:
- Single Python project (cleaner monorepo structure)
- Shared dependencies and package management
- Easier testing and debugging
- Better code organization aligned with Principle VI (Monorepo Structure)

## Outcome

- ✅ Impact: Cleaner architecture with MCP server integrated into backend
- 🧪 Tests: No tests run (planning update)
- 📁 Files: 3 artifacts updated (plan.md, research.md, quickstart.md)
- 🔁 Next prompts: /sp.tasks to generate implementation tasks
- 🧠 Reflection: Architecture now follows monorepo best practices with single backend package. Ready for task generation.

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): All Constitution gates still pass
- Prompt variant (if applicable): Architectural simplification
- Next experiment: Generate tasks with /sp.tasks
