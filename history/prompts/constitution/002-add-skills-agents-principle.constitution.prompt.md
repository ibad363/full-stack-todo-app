---
id: 002
title: Add Skills & Agents Principle
stage: constitution
date: 2026-01-01
surface: agent
model: claude-sonnet-4-5
feature: none
branch: master
user: ibad363
command: /sp.constitution
labels: ["constitution", "skills", "agents", "amendment"]
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

i want to update my constitution when needed use skills of context7 for documentation and browser use i have skills in my .cluade/skills folder use context7 skills for documentation when needed and use browsing-with-playwright skills for Use for web browsing, form submission, web scraping, or UI testing when needed and use spec validation also and also use agents which is inside .claude/agents,when needed, 1st agent is frontend-spec-implementer, 2nd is backend-auth-guardian and spec-authority when needed also follow the monorepo structure frontend and backend in seperate folder

## Response snapshot

Updated constitution from v1.0.0 to v1.1.0 with the following additions:

**New Principle VIII: Skills & Agents Usage**
Added mandatory guidance for using specialized tools:

**Skills (.claude/skills/)**:
- context7-efficient: For library documentation, code examples, API references
- browsing-with-playwright: For web browsing, form submission, web scraping, UI testing
- spec-validation: For validating Phase II specifications before planning/implementation

**Agents (.claude/agents/)**:
- spec-authority: Gatekeeper for SDD process, validates specs before implementation
- frontend-spec-implementer: Implements Next.js UI components with secure API integration
- backend-auth-guardian: Develops FastAPI routes, schemas, authentication with ownership enforcement

**Updated sections**:
- Monorepo Structure (Principle VI): Added `.claude/skills/` and `.claude/agents/` paths
- Development Workflow: Added spec-validation step, backend-auth-guardian and frontend-spec-implementer usage
- Documentation Research: Added context7-efficient usage guidance
- Architecture Standards: Added agent usage for backend/frontend development
- Testing: Added browsing-with-playwright for E2E testing

**Version bump**: 1.0.0 → 1.1.0 (MINOR - new principle added)

## Outcome

- ✅ Impact: Constitution now enforces use of skills and agents for appropriate tasks, improving efficiency and consistency
- 🧪 Tests: Template validation passed (3 templates checked, no changes needed)
- 📁 Files: Updated `.specify/memory/constitution.md` (v1.1.0)
- 🔁 Next prompts: Ready for feature development with enforced skills/agents usage
- 🧠 Reflection: New principle ensures specialized tools are used proactively, maintaining SDD integrity through spec-authority agent

## Evaluation notes (flywheel)

- Failure modes observed: None - amendment successful
- Graders run and results (PASS/FAIL): PASS - All templates validated, no inconsistencies found
- Prompt variant (if applicable): Standard constitution amendment
- Next experiment (smallest change to try): Create first feature spec using spec-validation skill to verify enforcement
