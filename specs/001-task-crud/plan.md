# Implementation Plan: Multi-User Task Management

**Branch**: `001-task-crud` | **Date**: 2026-01-01 | **Spec**: [`@specs/001-task-crud/spec.md`](../specs/001-task-crud/spec.md)
**Input**: Feature specification from `/specs/001-task-crud/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a full-stack, multi-user task management web application with persistent storage and secure authentication. Users can sign up/log in via Better Auth (JWT tokens), create/view/update/delete/toggle tasks scoped to their account. Frontend uses Next.js 16+ App Router, backend uses FastAPI with SQLModel ORM, data stored in Neon Serverless PostgreSQL. Authentication is stateless, token-based, with 401/403 errors for unauthorized access and strict user isolation.

## Technical Context

**Language/Version**:
- Python 3.11+ (Backend)
- TypeScript 5.0+ (Frontend)
- Node.js 20+ (Frontend runtime)

**Primary Dependencies**:
- Backend: FastAPI 0.104+, SQLModel 0.0.14+, Pydantic 2.5+, uvicorn[standard], python-jose[cryptography], passlib[bcrypt], python-multipart
- Frontend: Next.js 16+, React 18+, better-auth, @tanstack/react-query (optional but recommended)
- Database: Neon Serverless PostgreSQL (PostgreSQL 15+ compatible)

**Storage**: Neon Serverless PostgreSQL with connection pooling for serverless workloads

**Testing**:
- Backend: pytest, pytest-asyncio, httpx (for testing FastAPI)
- Frontend: Jest, React Testing Library
- E2E: Playwright (via browsing-with-playwright skill for critical flows)

**Target Platform**:
- Backend: Linux server (containerized, can run on Vercel, Railway, Render)
- Frontend: Web browsers (modern browsers supporting ES6+)

**Project Type**: Web application (monorepo with separate frontend and backend)

**Performance Goals**:
- API endpoint response time: <200ms p95 for task operations
- Authentication token validation: <50ms
- Database queries: <100ms p95 with proper indexing
- Support 10,000 users with their tasks without performance degradation
- Frontend page load: <2s First Contentful Paint

**Constraints**:
- Token-based stateless authentication (JWT)
- Strict user isolation (no cross-user data access)
- HTTPS only in production
- Environment-based configuration (secrets in .env, never hardcoded)
- CORS configured with explicit origins (no wildcard)
- All API endpoints require valid JWT authentication
- Task titles max 200 chars, descriptions max 2000 chars
- Passwords minimum 8 characters

**Scale/Scope**:
- Initial capacity: 10,000 users
- Tasks per user: unbounded but practical limit ~10,000 (with pagination if needed)
- 5 core task operations: Create, Read, Update, Delete, Toggle Complete
- Single database (Neon PostgreSQL)
- Monorepo structure with separate frontend/backend directories

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### GATE Results

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Spec-Driven Development | ✅ PASS | Using Spec-Kit Plus workflow (spec → plan → tasks → implementation) |
| II. Authentication & Authorization | ✅ PASS | Better Auth (JWT) frontend + JWT verification backend, centralized auth logic |
| III. Task Ownership & Data Isolation | ✅ PASS | user_id foreign key on tasks, ownership validation before all operations |
| IV. Environment-Based Configuration | ✅ PASS | All secrets via .env, .env.example provided, fail-fast on missing env vars |
| V. Clean Code Standards | ✅ PASS | PEP 8 (Python), type hints, docstrings; TypeScript strict mode; proper SQL indexing |
| VI. Monorepo Structure | ✅ PASS | /specs/, /frontend/, /backend/, /history/, /.specify/, /.claude/ structure maintained |
| VII. Documentation & Traceability | ✅ PASS | PHRs after every user input, ADRs for significant decisions |
| VIII. Skills & Agents Usage | ✅ PASS | Will use spec-authority, frontend-spec-implementer, backend-auth-guardian agents |

### Security Requirements Compliance

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| HTTPS only in production | ✅ PASS | Configure in deployment (Vercel/Railway) |
| CORS with explicit origins | ✅ PASS | FastAPI CORSMiddleware with origin whitelist |
| Input validation on all endpoints | ✅ PASS | Pydantic models for request/response validation |
| SQL injection prevention | ✅ PASS | SQLModel ORM (no raw SQL) |
| Rate limiting on auth endpoints | ✅ PASS | slowapi or similar middleware |
| XSS prevention | ✅ PASS | React's default escaping |
| CSRF protection | ✅ PASS | SameSite cookies (Better Auth) |
| Secure token storage | ✅ PASS | httpOnly cookies via Better Auth |
| Database connection strings in env vars | ✅ PASS | DATABASE_URL in .env |
| Principle of least privilege | ✅ PASS | Dedicated database user with minimal permissions |

**✅ ALL GATES PASSED - Proceed to Phase 0 Research**

## Project Structure

### Documentation (this feature)

```text
specs/001-task-crud/
├── spec.md              # Feature specification
├── plan.md              # This file (implementation plan)
├── research.md          # Phase 0 output (technology research)
├── data-model.md        # Phase 1 output (database schema)
├── quickstart.md        # Phase 1 output (developer onboarding)
├── contracts/           # Phase 1 output (API contracts)
│   ├── openapi.yaml     # OpenAPI 3.0 spec
│   └── api-overview.md  # API documentation summary
└── tasks.md             # Phase 2 output (implementation tasks)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/
│   │   ├── user.py          # SQLModel User model
│   │   └── task.py          # SQLModel Task model
│   ├── api/
│   │   ├── dependencies.py  # Dependency injection (auth, DB)
│   │   ├── auth.py          # Authentication endpoints (register/login)
│   │   └── tasks.py         # Task CRUD endpoints
│   ├── core/
│   │   ├── config.py        # Environment configuration
│   │   ├── security.py      # JWT verification/password hashing
│   │   └── database.py      # Database connection & session management
│   └── main.py              # FastAPI application entry point
├── tests/
│   ├── test_auth.py         # Authentication tests
│   ├── test_tasks.py        # Task CRUD tests
│   └── conftest.py          # Pytest fixtures
├── .env.example             # Required environment variables
├── pyproject.toml           # UV package manager configuration
└── requirements.txt         # Generated from pyproject.toml

frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx       # Root layout with auth provider
│   │   ├── page.tsx         # Landing/login page
│   │   ├── dashboard/
│   │   │   ├── page.tsx     # Dashboard (task list)
│   │   │   └── layout.tsx   # Dashboard layout (protected route)
│   │   └── login/
│   │       └── page.tsx     # Login page
│   ├── components/
│   │   ├── TaskList.tsx     # Task list component
│   │   ├── TaskItem.tsx     # Single task component
│   │   ├── TaskForm.tsx     # Create/edit task form
│   │   └── auth/
│   │       ├── AuthProvider.tsx      # Better Auth provider
│   │       └── LoginForm.tsx         # Login form
│   ├── lib/
│   │   ├── api.ts           # API client (fetch wrapper with JWT)
│   │   ├── types.ts         # TypeScript types matching backend models
│   │   └── auth.ts          # Authentication utilities
│   └── middleware.ts        # Route protection middleware
├── .env.local.example       # Frontend env variables
├── package.json
├── tsconfig.json
└── next.config.js
```

**Structure Decision**: Web application structure with separate frontend and backend directories. Backend uses FastAPI with layered architecture (models, API routes, core services). Frontend uses Next.js 16 App Router with server components by default. Clear separation of concerns with shared contracts in `/contracts/` directory.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | All constitution principles satisfied |

---

## Phases & Execution Order

### Phase 0: Research & Technology Validation

**Goal**: Resolve all NEEDS CLARIFICATION items and validate technology choices.

**Outputs**: `research.md`

**Tasks**:
1. Research Better Auth integration with Next.js 16 App Router
2. Research FastAPI + SQLModel patterns for multi-user data isolation
3. Research Neon PostgreSQL connection pooling for serverless
4. Research JWT token verification best practices (HS256 vs RS256)
5. Research Next.js API client patterns for authenticated requests

**Validation**: All research decisions documented with rationale and alternatives considered.

---

### Phase 1: Design & Contracts

**Goal**: Define data models, API contracts, and developer documentation.

**Prerequisites**: Phase 0 complete

**Outputs**: `data-model.md`, `/contracts/`, `quickstart.md`

**Tasks**:
1. **Data Model Design** (`data-model.md`):
   - Define User model (id, email, password_hash, created_at)
   - Define Task model (id, user_id, title, description, completed, created_at, updated_at, completed_at)
   - Define relationships (User -> Tasks 1:N)
   - Define validation rules and constraints
   - Define indexing strategy (user_id, created_at)

2. **API Contracts** (`/contracts/openapi.yaml`):
   - POST /api/auth/register - User registration
   - POST /api/auth/login - User login (returns JWT)
   - POST /api/auth/logout - Logout (optional, mainly for client-side cleanup)
   - GET /api/tasks - List user's tasks (sorted: incomplete first, by created_at)
   - POST /api/tasks - Create new task
   - GET /api/tasks/{id} - Get specific task
   - PATCH /api/tasks/{id} - Update task (title, description)
   - PATCH /api/tasks/{id}/toggle - Toggle completion status
   - DELETE /api/tasks/{id} - Delete task
   - Include error responses (401, 403, 404, 422)
   - Include request/response schemas with examples

3. **Quickstart Guide** (`quickstart.md`):
   - Prerequisites (Node.js 20+, Python 3.11+, UV)
   - Environment setup (.env files)
   - Local development commands (frontend dev, backend dev)
   - Database migration commands
   - Testing commands
   - Common debugging tasks

4. **Agent Context Update**:
   - Run `.specify/scripts/powershell/update-agent-context.ps1 -AgentType claude`
   - Update agent-specific files with new technology stack

**Validation**:
- Data model covers all entities from spec
- API contracts satisfy all functional requirements
- Quickstart enables new developer to run app in 10 minutes

---

### Phase 2: Implementation Tasks Generation

**Goal**: Break down implementation into testable, dependency-ordered tasks.

**Prerequisites**: Phase 1 complete

**Output**: `tasks.md` (generated by `/sp.tasks` command, not by this plan)

**Note**: This phase is executed via the `/sp.tasks` command, which reads `spec.md`, `plan.md`, `data-model.md`, and `/contracts/` to generate a comprehensive task list.

**Expected Task Structure** (to be generated):
1. Backend infrastructure (config, database, security)
2. Backend models and migrations
3. Backend authentication (JWT verification, dependencies)
4. Backend task API endpoints (CRUD + toggle)
5. Backend testing (unit, integration)
6. Frontend authentication (Better Auth setup, login/register forms)
7. Frontend API client (fetch wrapper, error handling)
8. Frontend task components (list, item, form)
9. Frontend pages (dashboard, login, protected routes)
10. Integration testing (E2E)
11. Documentation updates

**Validation**: All tasks are testable, have clear acceptance criteria, and respect the constitution.

---

## Architecture Decisions (Significant)

These decisions may warrant ADRs. Flag with: 📋 Architectural decision detected: [brief] — Document reasoning and tradeoffs? Run `/sp.adr <decision-title>`

### 1. Authentication Strategy (JWT vs Session-based)

**Decision**: JWT tokens issued by Better Auth (frontend) and verified by FastAPI (backend).

**Rationale**:
- Stateless, scales horizontally without server-side session storage
- Better Auth provides battle-tested JWT handling with secure cookies
- Backend can be deployed independently on serverless platforms
- Tokens easily shared across microservices if architecture evolves

**Alternatives Considered**:
- Session-based: Requires server-side session store (Redis), harder to scale
- Third-party auth (OAuth): Overkill for initial scope, can add later

**ADR Worthy?**: ✅ YES - Run `/sp.adr jwt-authentication-strategy`

---

### 2. Database ORM Choice (SQLModel vs SQLAlchemy vs Prisma)

**Decision**: SQLModel for backend.

**Rationale**:
- Built on SQLAlchemy + Pydantic 2 (FastAPI native)
- Single source of truth for database models and Pydantic schemas
- Type-safe, IDE-friendly, excellent FastAPI integration
- Easy migration path if needed (Alembic compatible)

**Alternatives Considered**:
- SQLAlchemy alone: No automatic Pydantic schema generation
- Prisma: Not native to Python, ecosystem smaller

**ADR Worthy?**: ✅ YES - Run `/sp.adr sqlmodel-orm-choice`

---

### 3. Neon PostgreSQL vs Standard PostgreSQL

**Decision**: Neon Serverless PostgreSQL.

**Rationale**:
- Free tier for development
- Auto-scaling serverless architecture
- Built-in connection pooling for serverless workloads
- PostgreSQL-compatible (no vendor lock-in)

**Alternatives Considered**:
- Standard PostgreSQL (managed on RDS/supabase): Requires always-on instance, higher cost
- SQLite: No multi-user isolation (file-based), not suitable for production

**ADR Worthy?**: ✅ YES - Run `/sp.adr neon-postgresql-choice`

---

## Risk Analysis & Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| JWT secret exposed | Low | High | Environment variables, rotation strategy, never commit to git |
| SQL injection | Low | Critical | SQLModel ORM, no raw SQL, input validation |
| Cross-user data leakage | Medium | High | Backend ownership validation, comprehensive testing, code review |
| Token expiration UX | Medium | Medium | Refresh tokens, transparent token renewal, clear error messages |
| Database connection exhaustion | Low | Medium | Neon connection pooling, connection limits, monitoring |
| CORS misconfiguration | Low | Medium | Explicit origin whitelist, testing with production origins |

---

## Success Criteria (from Spec)

- Users can register/login in under 90 seconds (SC-001)
- Task operations complete in under 2 seconds (SC-002)
- 100% unauthorized attempts return 401/403 (SC-003)
- 100% task operations scoped to user (SC-004)
- 99.9% task data persistence (SC-005)
- Support 10,000 users without degradation (SC-007)

---

## Follow-ups & Risks

1. **Token Refresh Strategy**: Plan should clarify JWT expiration and refresh token implementation (short-lived access tokens + long-lived refresh tokens)
2. **Pagination for Large Task Lists**: If users accumulate many tasks, pagination/virtualization may be needed in frontend
3. **Database Migration Tooling**: Plan mentions Alembic but doesn't explicitly include migration tasks (ensure this is covered in `tasks.md`)
4. **CORS Configuration**: Ensure frontend origin (localhost:3000 dev, production domain) is correctly configured
5. **Testing Coverage**: Verify tasks.md includes unit tests for backend, component tests for frontend, and E2E tests for critical flows

---

## Next Steps

1. Execute Phase 0: Generate `research.md` by running research tasks
2. Execute Phase 1: Generate `data-model.md`, `/contracts/`, and `quickstart.md`
3. Re-evaluate Constitution Check post-design
4. Execute `/sp.tasks` to generate `tasks.md` (Phase 2)
5. Begin implementation via agents:
   - `backend-auth-guardian` for backend API endpoints and authentication
   - `frontend-spec-implementer` for frontend UI components and secure API integration
