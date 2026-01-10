---
id: 001
title: Create Todo AI Chatbot spec
stage: spec
date: 2026-01-11
surface: agent
model: claude-sonnet-4-5-20250929
feature: todo-ai-chatbot
branch: 1-todo-ai-chatbot
user: ibad363
command: /sp.specify
labels: ["feature","ai-chatbot","mcp","openai-agents"]
links:
  spec: specs/001-todo-ai-chatbot/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/001-todo-ai-chatbot/spec.md
  - specs/001-todo-ai-chatbot/checklists/requirements.md
tests: []
---

## Prompt

Project: Hackathon 2 – Phase III: Todo AI Chatbot

Context:
In Phase II, I successfully built a full-stack multi-user Todo web application using a Spec-Driven, Agentic Dev Stack workflow (Claude Code + Spec-Kit Plus). The application includes:
- Next.js (App Router) frontend
- Python FastAPI backend
- SQLModel ORM
- Neon Serverless PostgreSQL
- RESTful APIs for task management
- A custom authentication system (NOT Better Auth)

Phase III builds directly on the Phase II codebase and improves it by introducing an AI-powered conversational interface for managing todos using natural language.

Important Constraints:
- Phase II functionality must remain fully intact and be reused
- Use a custom-built Next.js chatbot component for the frontend

Objective:
Create a stateless, AI-powered Todo chatbot that allows users to manage their tasks using natural language. The AI must interact with the backend exclusively via MCP (Model Context Protocol) tools.

High-Level Requirements:
1. Implement a conversational chatbot interface for all existing Todo features
2. Use OpenAI Agents SDK to power the AI reasoning and decision-making
3. Build a standalone MCP server using the Official MCP SDK
4. Expose task operations as MCP tools
5. Maintain a stateless backend architecture where:
   - Chat requests are stateless
   - Conversation history is persisted in the database
6. Reuse the existing custom authentication system from Phase II
7. Enforce user isolation for all conversations and tasks

Technology Stack:
Frontend:
- Next.js 16+ (App Router)
- Custom-built chatbot UI component

Backend:
- Python FastAPI

AI Framework:
- OpenAI Agents SDK

MCP Server:
- Official MCP SDK

ORM:
- SQLModel

Database:
- Neon Serverless PostgreSQL

Authentication:
- Custom authentication flow from Phase II

Database Models:
Task:
- user_id
- id
- title
- description
- completed
- created_at
- updated_at

Conversation:
- user_id
- id
- created_at
- updated_at

Message:
- user_id
- id
- conversation_id
- role (user | assistant)
- content
- created_at

Chat API:
Endpoint:
POST /api/{user_id}/chat

Request Body:
- conversation_id (integer, optional)
  - If not provided, a new conversation is created
- message (string, required)
  - User's natural language input

Response:
- conversation_id (integer)
- response (string)
- tool_calls (array)
  - List of MCP tools invoked by the agent

Conversation Flow (Stateless Request Cycle):
1. Receive user message
2. Fetch conversation history from database
3. Append new user message
4. Store user message in database
5. Run OpenAI Agent with MCP tools
6. Agent decides which tool(s) to invoke
7. MCP tools interact with the database
8. Store assistant response in database
9. Return response to frontend
10. Server holds no in-memory state between requests

MCP Tools Specification:

Tool: add_task
Purpose:
Create a new task
Parameters:
- user_id (string, required)
- title (string, required)
- description (string, optional)
Returns:
- task_id
- status
- title

Tool: list_tasks
Purpose:
Retrieve tasks
Parameters:
- user_id (string, required)
- status (string, optional: all | pending | completed)
Returns:
- Array of task objects

Tool: complete_task
Purpose:
Mark task as completed
Parameters:
- user_id (string, required)
- task_id (integer, required)
Returns:
- task_id
- status
- title

Tool: delete_task
Purpose:
Delete a task
Parameters:
- user_id (string, required)
- task_id (integer, required)
Returns:
- task_id
- status
- title

Tool: update_task
Purpose:
Update task title and/or description
Parameters:
- user_id (string, required)
- task_id (integer, required)
- title (string, optional)
- description (string, optional)
Returns:
- task_id
- status
- title

Agent Behavior Rules:
- Use add_task when user intends to create or remember something
- Use list_tasks when user asks to see, show, or list tasks
- Use complete_task when user says done, finished, or complete
- Use delete_task when user says delete, remove, or cancel
- Use update_task when user says change, update, or rename
- Always confirm actions in natural language
- Gracefully handle errors (task not found, invalid input)

Natural Language Understanding Examples:
- "Add a task to buy groceries" → add_task
- "Show me all my tasks" → list_tasks(status=all)
- "What's pending?" → list_tasks(status=pending)
- "Mark task 3 as complete" → complete_task
- "Delete the meeting task" → list_tasks then delete_task
- "Change task 1 to 'Call mom tonight'" → update_task
- "I need to remember to pay bills" → add_task
- "What have I completed?" → list_tasks(status=completed)

Deliverables:
- Updated specification for Phase III
- MCP server specification
- Agent behavior specification
- API contract definitions
- Database interaction rules
- Clear separation of frontend, backend, MCP server, and AI agent responsibilities

## Response snapshot

Created feature specification for Todo AI Chatbot:
- Branch: 1-todo-ai-chatbot
- Spec file: specs/001-todo-ai-chatbot/spec.md
- Checklist: specs/001-todo-ai-chatbot/checklists/requirements.md

Specification includes:
- 7 user stories with priorities (P1, P2) covering all CRUD operations
- 17 functional requirements
- 3 key entities (Task, Conversation, Message)
- 7 measurable success criteria
- Edge cases and assumptions documented
- Out of scope items clearly defined

## Outcome

- ✅ Impact: Created comprehensive specification for Phase III AI Chatbot feature
- 🧪 Tests: No tests run (specification phase)
- 📁 Files: 2 files created (spec.md, requirements.md)
- 🔁 Next prompts: /sp.clarify or /sp.plan
- 🧠 Reflection: Specification is complete with no clarifications needed. Ready for planning phase.

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): All quality checklist items pass
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A
