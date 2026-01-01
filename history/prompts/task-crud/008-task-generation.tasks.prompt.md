---
id: 008
title: task-generation
stage: tasks
date: 2026-01-01
surface: agent
model: claude-sonnet-4-5-20250929
feature: task-crud
branch: 001-task-crud
user: system
command: /sp.tasks
labels: ["task-generation","implementation","full-stack","user-stories"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - specs/001-task-crud/tasks.md
tests:
 - none

---

## Prompt

$ARGUMENTS

## Task Generation Rules

**CRITICAL**: Tasks MUST be organized by user story to enable independent implementation and testing.

**Tests are OPTIONAL**: Only generate test tasks if explicitly requested in feature specification or if user requests TDD approach.

### Checklist Format (REQUIRED)

Every task MUST strictly follow this format:

```text
- [ ] [TaskID] [P?] [Story?] Description with file path
```

**Format Components**:

1. **Checkbox**: ALWAYS start with `- [ ]` (markdown checkbox)
2. **Task ID**: Sequential number (T001, T002, T003...) in execution order
3. **[P] marker**: Include ONLY if task is parallelizable (different files, no dependencies on incomplete tasks)
4. **[Story] label**: REQUIRED for user story phase tasks only
   - Format: [US1], [US2], [US3], etc. (maps to user stories from spec.md)
   - Setup phase: NO story label
   - Foundational phase: NO story label
   - User Story phases: MUST have story label
   - Polish phase: NO story label
5. **Description**: Clear action with exact file path

**Examples**:

- ✅ CORRECT: `- [ ] T001 Create project structure per implementation plan`
- ✅ CORRECT: `- [ ] T005 [P] Implement authentication middleware in src/middleware/auth.py`
- ✅ CORRECT: `- [ ] T012 [P] [US1] Create User model in src/models/user.py`
- ✅ CORRECT: `- [ ] T014 [US1] Implement UserService in src/services/user_service.py`
- ❌ WRONG: `- [ ] Create User model` (missing ID and Story label)
- ❌ WRONG: `T001 [US1] Create model` (missing checkbox)
- ❌ WRONG: `- [ ] [US1] Create User model` (missing Task ID)
- ❌ WRONG: `- [ ] T001 [US1] Create model` (missing file path)

### Task Organization

1. **From User Stories (spec.md)** - PRIMARY ORGANIZATION:
   - Each user story (P1, P2, P3...) gets its own phase
   - Map all related components to their story:
     - Models needed for that story
     - Services needed for that story
     - Endpoints/UI needed for that story
     - If tests requested: Tests specific to that story
   - Mark story dependencies (most stories should be independent)

2. **From Contracts**:
   - Map each contract/endpoint → to user story it serves
   - If tests requested: Each contract → contract test task [P] before implementation in that story's phase

3. **From Data Model**:
   - Map each entity to user story(ies) that need it
   - If entity serves multiple stories: Put in earliest story or Setup phase
   - Relationships → service layer tasks in appropriate story phase

4. **From Setup/Infrastructure**:
   - Shared infrastructure → Setup phase (Phase 1)
   - Foundational/blocking tasks → Foundational phase (Phase 2)
   - Story-specific setup → within that story's phase

### Phase Structure

- **Phase 1**: Setup (project initialization)
- **Phase 2**: Foundational (blocking prerequisites - MUST complete before user stories)
- **Phase 3+**: User Stories in priority order (P1, P2, P3...)
  - Within each story: Tests (if requested) → Models → Services → Endpoints → Integration
  - Each phase should be a complete, independently testable increment
- **Final Phase**: Polish & Cross-Cutting Concerns

## Response snapshot

Successfully generated comprehensive implementation tasks for multi-user task management application organized by user story.

**Total Tasks**: 80 tasks across 6 phases

**Tasks by Phase**:
- Phase 1 (Setup): 9 tasks (T001-T009)
- Phase 2 (Foundational): 14 tasks (T010-T023) - CRITICAL BLOCKING PHASE
- Phase 3 (User Story 1 - Authentication, P1, MVP): 20 tasks (T024-T044) - frontend + backend
- Phase 4 (User Story 2 - Task CRUD, P1): 19 tasks (T045-T064) - frontend + backend
- Phase 5 (User Story 3 - Persistence, P2): 5 tasks (T065-T070) - frontend + backend
- Phase 6 (Polish & Cross-Cutting): 12 tasks (T069-T080)

**Tasks by User Story**:
- User Story 1 (P1 - Authentication): 20 tasks (T024-T044)
- User Story 2 (P1 - Task CRUD): 19 tasks (T045-T064)
- User Story 3 (P2 - Persistence): 5 tasks (T065-T070)

**Test Coverage**:
- Backend: pytest tests for authentication (T032), task CRUD (T054), persistence (T066)
- Frontend: Jest + React Testing Library for auth components (T044), task components (T064), persistence (T070)
- E2E: Playwright test for critical flow (T080)

**Parallel Opportunities Identified**:
- Phase 1: All tasks can run in parallel (different files)
- Phase 2: All 14 tasks can run in parallel (different components)
- Phase 3 (US1): 10 parallelizable tasks marked [P] (T028-T030, T031, T033-T040, T041-T044)
- Phase 4 (US2): 4 parallelizable backend tasks marked [P] (T045-T047), 3 parallelizable frontend tasks (T055-T056, T058, T062)
- Phase 6: 6 parallelizable tasks marked [P] (T069-T072, T074, T076, T078-T080)

**MVP Scope**: User Stories 1 (Authentication) + 2 (Task CRUD) - 39 tasks total after foundational phase. Users can register, login, and fully manage tasks.

**Format Validation**: All 80 tasks follow checklist format with checkbox, Task ID, [P] marker (where applicable), [Story] label (for user story phases), and exact file paths.

## Outcome

- ✅ Impact: Generated comprehensive, dependency-ordered implementation tasks organized by user story. All tasks follow strict checklist format with clear file paths. Total 80 tasks enable incremental delivery with MVP (US1+US2) delivering core value early.
- 🧪 Tests: Tests are INCLUDED and REQUIRED for this feature - pytest for backend (T032, T054, T066), Jest + React Testing Library for frontend (T044, T064, T070), E2E with Playwright (T080). All tests marked with [P] for parallel execution where possible.
- 📁 Files: Single tasks.md file created at specs/001-task-crud/tasks.md (80 tasks, 400+ lines).
- 🔁 Next prompts: Begin implementation using specialized agents. Use `backend-auth-guardian` for backend tasks (T010-T068, T069-T075, T079) and `frontend-spec-implementer` for frontend tasks (T035-T044, T055-T064, T067-T068, T070-T078, T080).
- 🧠 Reflection: Tasks properly organized by user story enabling independent implementation and testing. MVP scope (US1+US2) clear. Parallel opportunities maximized. Format strict compliance validated.

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): Not applicable (task generation)
- Prompt variant (if applicable): standard
- Next experiment (smallest change to try): Begin Phase 1 (Setup) execution with parallel task dispatch, then proceed to Phase 2 (Foundational) which is blocking. After Phase 2 complete, can execute User Stories 1 and 2 in parallel across different team members.
