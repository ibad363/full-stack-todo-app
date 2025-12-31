---
id: 001
title: Create Project Constitution
stage: constitution
date: 2026-01-01
surface: agent
model: claude-sonnet-4-5
feature: none
branch: master
user: ibad363
command: /sp.constitution
labels: ["constitution", "governance", "project-setup", "spec-kit-plus"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
  - Template validation (plan-template.md, spec-template.md, tasks-template.md)
---

## Prompt

Create a /sp.constitution for Phase II: Todo Full-Stack Web Application using Spec-Kit Plus.

This Constitution must define GLOBAL, IMMUTABLE rules that apply to the entire project.

Project context:
- Monorepo using Spec-Kit Plus + Claude Code
- Frontend: Next.js 16+ (App Router)
- Backend: Python FastAPI
- ORM: SQLModel
- Database: Neon Serverless PostgreSQL
- Authentication: Better Auth (frontend) issuing JWTs, verified by FastAPI backend
- Multi-user system with strict task ownership

Global rules to enforce:
- Spec-driven development is mandatory (no manual coding)
- All API routes require valid JWT authentication
- Users may only access their own tasks
- JWT secret is shared via environment variables
- Clean code standards (PEP 8 for Python, idiomatic Next.js)
- Monorepo structure with specs/, history/, frontend/, backend/
- ADRs and prompt history must be recorded
- Environment variables must be used for all secrets

Output:
- Produce only the /sp.constitution document
- Use clear sections and concise

## Response snapshot

Created comprehensive constitution at `.specify/memory/constitution.md` version 1.0.0 with:

**7 Core Principles:**
1. Spec-Driven Development (SDD) - Mandatory workflow through spec.md → plan.md → tasks.md
2. Authentication & Authorization - JWT validation on all API endpoints
3. Task Ownership & Data Isolation - User-scoped queries only
4. Environment-Based Configuration - No hardcoded secrets
5. Clean Code Standards - PEP 8 (Python), idiomatic Next.js (TypeScript)
6. Monorepo Structure - Standardized /specs, /history, /frontend, /backend layout
7. Documentation & Traceability - PHRs and ADRs mandatory

**Additional Sections:**
- Security Requirements (API, Frontend, Database security policies)
- Development Workflow (feature development → PHR → ADR flow)
- Architecture Standards (FastAPI, Next.js App Router, Neon PostgreSQL, testing)
- Governance (amendment process, version semantics, compliance)

**Template Validation:**
- Reviewed plan-template.md - Constitution Check section aligns ✅
- Reviewed spec-template.md - Requirements structure compatible ✅
- Reviewed tasks-template.md - Task organization supports principles ✅

## Outcome

- ✅ Impact: Project constitution established with 7 immutable principles governing full-stack todo app development
- 🧪 Tests: Validated template consistency (3 templates checked)
- 📁 Files: Created `.specify/memory/constitution.md` (v1.0.0)
- 🔁 Next prompts: Ready for `/sp.specify <feature>` to create feature specs following SDD workflow
- 🧠 Reflection: Constitution enforces security-first approach (JWT auth, data isolation) and maintains traceability through mandatory PHR/ADR creation

## Evaluation notes (flywheel)

- Failure modes observed: None - initial constitution creation successful
- Graders run and results (PASS/FAIL): PASS - All placeholders filled, templates validated, routing confirmed
- Prompt variant (if applicable): Standard constitution creation
- Next experiment (smallest change to try): Apply constitution to first feature spec to validate SDD workflow enforcement
