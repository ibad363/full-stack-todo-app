---

description: "Task list for feature implementation"
---

# Tasks: Multi-User Task Management

**Input**: Design documents from `/specs/001-task-crud/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: This implementation includes test tasks. Tests are REQUIRED for backend validation (pytest) and frontend integration (Jest + React Testing Library).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- **Web app**: `backend/src/`, `frontend/src/`

<!--
  ============================================================================
  Tasks below are ACTUAL TASKS generated from spec.md, plan.md, data-model.md, and contracts/
  ============================================================================
-->

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create backend directory structure at backend/src/{models,api,core}
- [x] T002 Create frontend directory structure at frontend/src/{app,components,lib}
- [x] T003 Initialize backend project using uv in backend/ (mkdir backend && cd backend && uv init)
- [x] T004 Initialize frontend Next.js project with package.json in frontend/
- [x] T005 [P] Create backend/.env.example file with DATABASE_URL, JWT_SECRET, ACCESS_TOKEN_EXPIRE_MINUTES, ENVIRONMENT
- [x] T006 [P] Create frontend/.env.local.example file with NEXT_PUBLIC_API_URL
- [x] T007 Configure backend/pyproject.toml with required dependencies using uv add (fastapi, uvicorn, sqlmodel, pydantic-settings, pwdlib, python-jose, python-multipart)
- [x] T008 Create frontend/tsconfig.json with strict mode enabled
- [x] T009 Add .gitignore entries for .env files and node_modules, __pycache__

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T010 Create database connection engine in backend/src/core/database.py with pool_pre_ping=True, pool_recycle=3600
- [x] T011 [P] Create database session dependency in backend/src/api/dependencies.py with get_session() generator
- [x] T012 Create environment configuration in backend/src/core/config.py with Settings class using pydantic_settings
- [x] T013 [P] Implement password hashing with Argon2 in backend/src/core/security.py (hash_password, verify_password)
- [x] T014 [P] Implement JWT token creation in backend/src/core/security.py (create_access_token with HS256 algorithm)
- [x] T015 [P] Implement JWT token verification in backend/src/core/security.py (verify_access_token returning User object)
- [x] T016 [P] Create OAuth2PasswordBearer scheme in backend/src/core/security.py for FastAPI integration
- [x] T017 Create User SQLModel with id, email (unique), password_hash, created_at in backend/src/models/user.py
- [x] T018 Create Task SQLModel with id, user_id (FK), title, description, completed, timestamps in backend/src/models/task.py
- [x] T019 Create User/Task relationship (back_populates) in backend/src/models/
- [x] T020 Create FastAPI application entry point in backend/src/main.py with CORS middleware configured

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - User Registration and Authentication (Priority: P1) 🎯 MVP

**Goal**: Enable users to register accounts and securely authenticate with JWT tokens

**Independent Test**: Can be fully tested by registering a new account, logging in with those credentials, and verifying that authenticated access is granted while unauthorized requests are denied.

### Backend Authentication (US1)

- [x] T021 [P] [US1] Create UserRegister Pydantic schema in backend/src/models/user.py with email validation and password min 8 chars
- [x] T022 [P] [US1] Create UserLogin Pydantic schema in backend/src/models/user.py with email and password fields
- [x] T023 [P] [US1] Create UserRead Pydantic schema in backend/src/models/user.py with id, email, created_at (no password_hash)
- [x] T024 [P] [US1] Create TokenResponse schema in backend/src/models/user.py with access_token, token_type, expires_in
- [x] T025 [P] [US1] Implement POST /api/auth/register endpoint in backend/src/api/auth.py that hashes password with Argon2 and creates User in DB
- [x] T026 [P] [US1] Implement POST /api/auth/login endpoint in backend/src/api/auth.py that verifies password and returns JWT token
- [x] T027 [P] [US1] Implement POST /api/auth/logout endpoint in backend/src/api/auth.py (client-side cleanup only)
- [x] T028 Add get_current_user dependency in backend/src/api/dependencies.py using OAuth2 scheme and JWT verification
- [x] T029 Test backend authentication with pytest in backend/tests/test_auth.py (register with valid data, register with invalid email, login with valid credentials, login with invalid credentials, JWT verification with expired token)

### Frontend Authentication (US1)

- [x] T030 [P] [US1] Install Better Auth package in frontend/ (npm install better-auth)
- [x] T031 [P] [US1] Create Better Auth configuration in frontend/src/lib/auth.ts with session configuration
- [x] T032 Create AuthProvider component in frontend/src/components/auth/AuthProvider.tsx wrapping Better Auth provider
- [x] T033 Create LoginForm component in frontend/src/components/auth/LoginForm.tsx with email and password fields
- [x] T034 Create RegisterForm component in frontend/src/components/auth/RegisterForm.tsx with email and password fields
- [x] T035 Create login page at frontend/src/app/login/page.tsx with LoginForm and redirect to dashboard on success
- [x] T036 Create register page at frontend/src/app/register/page.tsx with RegisterForm and redirect to login on success
- [x] T037 Update root layout in frontend/src/app/layout.tsx to include AuthProvider
- [x] T038 [P] [US1] Create API client wrapper in frontend/src/lib/api.ts with getAuthToken() from cookies and apiFetch() function
- [x] T039 [P] [US1] Add login/register API methods to frontend/src/lib/api.ts (api.login, api.register)
- [x] T040 Create route middleware in frontend/src/middleware.ts that redirects unauthenticated users to /login
- [x] T041 Test frontend authentication with Jest + React Testing Library in frontend/tests/auth.test.tsx (LoginForm renders correctly, RegisterForm validates email format, AuthProvider provides session, unauthenticated redirect to login works)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently - users can register, login, and receive JWT tokens.

---

## Phase 4: User Story 2 - Task Creation and Management (Priority: P1)

**Goal**: Enable authenticated users to create, view, edit, delete, and toggle completion status of tasks scoped to their account

**Independent Test**: Can be fully tested by an authenticated user creating a task, viewing it in a list, editing its content, toggling its completion status, and deleting it. All operations must persist and remain accessible only to the creating user.

### Backend Task CRUD (US2)

- [ ] T042 [P] [US2] Create TaskCreate Pydantic schema in backend/src/models/task.py with title (required, min 1, max 200), description (optional, max 2000)
- [ ] T043 [P] [US2] Create TaskUpdate Pydantic schema in backend/src/models/task.py with title (optional), description (optional)
- [ ] T044 [P] [US2] Create TaskRead Pydantic schema in backend/src/models/task.py with all task fields
- [ ] T045 [P] [US2] Implement GET /api/tasks endpoint in backend/src/api/tasks.py that filters by current_user.id and sorts by completed ASC, created_at ASC
- [ ] T046 [P] [US2] Implement POST /api/tasks endpoint in backend/src/api/tasks.py that creates task with user_id=current_user.id
- [ ] T047 [P] [US2] Implement GET /api/tasks/{task_id} endpoint in backend/src/api/tasks.py that validates ownership before returning task
- [ ] T048 [P] [US2] Implement PATCH /api/tasks/{task_id} endpoint in backend/src/api/tasks.py that validates ownership before updating title/description and updates updated_at timestamp
- [ ] T049 [P] [US2] Implement PATCH /api/tasks/{task_id}/toggle endpoint in backend/src/api/tasks.py that flips completed status, sets/clears completed_at, updates updated_at
- [ ] T050 [P] [US2] Implement DELETE /api/tasks/{task_id} endpoint in backend/src/api/tasks.py that validates ownership before deleting
- [ ] T051 Test backend task CRUD with pytest in backend/tests/test_tasks.py (create task, list tasks filtered by user, get task by ID, update task, toggle task, delete task, unauthorized access to another user's task returns 403, task not found returns 404)

### Frontend Task UI (US2)

- [ ] T052 [P] [US2] Create TypeScript types in frontend/src/lib/types.ts matching backend Pydantic schemas (User, Task, TaskCreate, TaskUpdate)
- [ ] T053 [P] [US2] Add task API methods to frontend/src/lib/api.ts (api.listTasks, api.createTask, api.updateTask, api.toggleTask, api.deleteTask, api.getTask)
- [ ] T054 Create TaskItem component in frontend/src/components/TaskItem.tsx displaying task details with edit/delete/toggle buttons
- [ ] T055 Create TaskForm component in frontend/src/components/TaskForm.tsx for creating/editing tasks with title and description fields
- [ ] T056 Create TaskList component in frontend/src/components/TaskList.tsx rendering list of TaskItem components
- [ ] T057 Create dashboard layout in frontend/src/app/dashboard/layout.tsx with route protection (unauthenticated users redirected to login)
- [ ] T058 Create dashboard page at frontend/src/app/dashboard/page.tsx that fetches tasks on load and renders TaskList
- [ ] T059 Add error handling to frontend/src/lib/api.ts for 401 (redirect to login), 403 (show forbidden message), 404 (show not found), 422 (show validation errors), 500 (show generic error)
- [ ] T060 Test frontend task UI with Jest + React Testing Library in frontend/tests/tasks.test.tsx (TaskForm creates task with valid title, TaskList renders tasks, TaskItem toggles completion, delete button calls API, error handling displays correctly)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - users can authenticate and fully manage their tasks.

---

## Phase 5: User Story 3 - Persistent Task Storage (Priority: P2)

**Goal**: Ensure all task data persists across sessions, so users see their tasks when they return to the application after logging out or closing the browser

**Independent Test**: Can be fully tested by creating tasks, logging out, logging back in, and verifying that all previously created tasks are still present and unchanged.

### Backend Persistence (US3)

- [ ] T061 [P] [US3] Verify Neon PostgreSQL connection pooling in backend/src/core/database.py handles serverless cold starts (pool_pre_ping=True confirmed)
- [ ] T062 [P] [US3] Verify database session management in backend/src/api/dependencies.py properly commits/rolls back transactions
- [ ] T063 Test task persistence with pytest in backend/tests/test_persistence.py (create task, close connection, reopen connection, verify task exists, update task, verify update persists, delete task, verify deletion persists)

### Frontend Persistence (US3)

- [ ] T064 [P] [US3] Verify Better Auth httpOnly cookies are configured securely in frontend/src/lib/auth.ts (httpOnly: true, secure: true in production)
- [ ] T065 Test frontend persistence in frontend/tests/persistence.test.tsx (create tasks, reload page, tasks still present, logout, login again, tasks still present, edit task, refresh, edit persists)

**Checkpoint**: All user stories should now be independently functional with full data persistence

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T066 [P] Update API documentation in specs/001-task-crud/contracts/api-overview.md with any discovered implementation details
- [ ] T067 [P] Update quickstart guide in specs/001-task-crud/quickstart.md with any discovered setup issues
- [ ] T068 [P] Add request/response examples to FastAPI OpenAPI docs in backend/src/main.py (auto-generated but verify examples)
- [ ] T069 [P] Implement rate limiting on authentication endpoints in backend/src/main.py (using slowapi or custom middleware) - 5 requests per IP per hour for register, 10 requests per minute for login
- [ ] T070 [P] Configure CORS origins whitelist in backend/src/main.py (http://localhost:3000 for dev, production domain for prod, no wildcard)
- [ ] T071 [P] Add logging to backend/src/core/security.py for successful logins, failed login attempts, JWT verification failures
- [ ] T072 [P] Add validation for JWT secret strength in backend/src/core/config.py (minimum 32 characters)
- [ ] T073 Verify database indexes in backend/src/models/task.py match data-model.md recommendations (user_id, created_at, compound index on user_id+completed+created_at)
- [ ] T074 [P] Add server-side error messages in backend/src/main.py (detailed errors in dev, generic in production)
- [ ] T075 Run backend test suite with coverage check in backend/ (pytest --cov=src --cov-report=html, verify >70% coverage)
- [ ] T076 Run frontend test suite in frontend/ (npm test, ensure all tests pass)
- [ ] T077 Run E2E test for critical flow in frontend/ (using Playwright via browsing-with-playwright skill: register → login → create task → toggle task → delete task)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User Story 1 (P1): Can start after Foundational (Phase 2) - No dependencies on other stories
  - User Story 2 (P1): Can start after Foundational (Phase 2) - Depends on US1 for authentication context but should be independently testable
  - User Story 3 (P2): Depends on US2 (task operations) for persistence verification
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1) - Authentication**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1) - Task CRUD**: Can start after Foundational (Phase 2) - Integrates with US1 for user context but tasks should be independently testable
- **User Story 3 (P2) - Persistence**: Depends on US2 being implemented - Persistence verification requires task operations to be functional

### Within Each User Story

- Tests MUST pass before implementation (backend)
- Models before endpoints (backend)
- Authentication before protected endpoints (backend)
- Components before pages (frontend)
- API client before pages that need data (frontend)
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] (T005-T009) can run in parallel
- All Foundational tasks marked [P] (T011-T020) can run in parallel within Phase 2
- Once Foundational phase completes, User Story 1 tasks marked [P] can run in parallel (T021-T027, T028, T030-T034, T038-T040)
- Once Foundational phase completes, User Story 2 backend tasks marked [P] can run in parallel (T042-T050)
- Once US1 is complete, User Story 2 frontend tasks marked [P] can run in parallel (T052-T056, T058-T060)
- All Polish phase tasks marked [P] (T066-T070, T074-T077) can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: Foundational Phase

```bash
# Launch all parallel tasks in Phase 2 (blocking prerequisites):
Task: "T013 [P] Implement password hashing with Argon2 in backend/src/core/security.py"
Task: "T014 [P] Implement JWT token creation in backend/src/core/security.py"
Task: "T015 [P] Implement JWT token verification in backend/src/core/security.py"
Task: "T016 [P] Create OAuth2PasswordBearer scheme in backend/src/core/security.py"
Task: "T017 Create User SQLModel with id, email (unique), password_hash, created_at in backend/src/models/user.py"
Task: "T018 Create Task SQLModel with id, user_id (FK), title, description, completed, timestamps in backend/src/models/task.py"
Task: "T019 Create User/Task relationship (back_populates) in backend/src/models/"
Task: "T020 Create FastAPI application entry point in backend/src/main.py with CORS middleware configured"
```

---

## Parallel Example: User Story 1 (Authentication)

```bash
# Launch all parallel tasks in User Story 1 (after Foundational complete):
Task: "T025 [P] [US1] Implement POST /api/auth/register endpoint in backend/src/api/auth.py"
Task: "T026 [P] [US1] Implement POST /api/auth/login endpoint in backend/src/api/auth.py"
Task: "T027 [P] [US1] Implement POST /api/auth/logout endpoint in backend/src/api/auth.py"
Task: "T028 [US1] Add get_current_user dependency in backend/src/api/dependencies.py"
Task: "T030 [P] [US1] Install Better Auth package in frontend/ (npm install better-auth)"
Task: "T031 [P] [US1] Create Better Auth configuration in frontend/src/lib/auth.ts"
Task: "T032 Create AuthProvider component in frontend/src/components/auth/AuthProvider.tsx"
Task: "T033 Create LoginForm component in frontend/src/components/auth/LoginForm.tsx"
Task: "T034 Create RegisterForm component in frontend/src/components/auth/RegisterForm.tsx"
Task: "T038 [P] [US1] Create API client wrapper in frontend/src/lib/api.ts"
Task: "T039 [P] [US1] Add login/register API methods to frontend/src/lib/api.ts"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

1. Complete Phase 1: Setup (T001-T009)
2. Complete Phase 2: Foundational (T010-T020) - CRITICAL - blocks all stories
3. Complete Phase 3: User Story 1 (T021-T041)
4. **STOP and VALIDATE**: Test User Story 1 independently - users can register and login
5. Complete Phase 4: User Story 2 (T042-T060)
6. **STOP and VALIDATE**: Test User Stories 1 + 2 together - authenticated users can manage tasks
7. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP! Auth works)
3. Add User Story 2 → Test independently → Deploy/Demo (Full CRUD works)
4. Add User Story 3 → Test independently → Deploy/Demo (Persistence verified)
5. Add Phase 6: Polish → Finalize and release
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T020)
2. Once Foundational is done:
   - Developer A: User Story 1 Backend (T025-T029)
   - Developer B: User Story 1 Frontend (T030-T041)
3. After US1 complete:
   - Developer A: User Story 2 Backend (T042-T051)
   - Developer B: User Story 2 Frontend (T052-T060)
4. After US2 complete:
   - Developer A: User Story 3 Backend + Polish (T061-T075)
   - Developer B: User Story 3 Frontend (T064-T076)
5. Stories complete and integrate independently

### Agent-Specific Implementation

**Backend Development** (Use `backend-auth-guardian` agent):
- All backend tasks (T010-T020, T021-T029, T050, T061-T075, T072, T075 backend tasks)
- Focus on SQLModel schemas, FastAPI routes, authentication, JWT verification, user ownership validation

**Frontend Development** (Use `frontend-spec-implementer` agent):
- All frontend tasks (T030-T041, T052-T060, T064-T066, T076, T077 frontend tasks)
- Focus on Next.js App Router, React components, Better Auth integration, secure API calls, error handling

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Tests are REQUIRED and should be written before implementation (TDD approach recommended)
- Verify tests fail before implementing for backend pytest tests
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- Backend tests use pytest (required for contract validation)
- Frontend tests use Jest + React Testing Library
- E2E tests use Playwright via browsing-with-playwright skill
- Always use `backend-auth-guardian` agent for backend API endpoints and authentication
- Always use `frontend-spec-implementer` agent for frontend UI components with secure API integration
- **NO Alembic configuration at this time** - Database managed via SQLModel directly
