<!--
Sync Impact Report:
Version: 1.0.0 → 1.1.0
Changes: Added Principle VIII for Skills & Agents usage
Modified Principles: None
Added Sections: Skills & Agents (new principle VIII)
Removed Sections: None
Templates Status:
  - plan-template.md: ✅ validated (no changes needed)
  - spec-template.md: ✅ validated (no changes needed)
  - tasks-template.md: ✅ validated (no changes needed)
Follow-up: None
-->

# Todo Full-Stack Web Application Constitution

## Core Principles

### I. Spec-Driven Development (SDD)

**MANDATORY**: All features MUST follow Spec-Kit Plus workflow:
- Feature specifications (`specs/<feature>/spec.md`) define requirements before implementation
- Architecture plans (`specs/<feature>/plan.md`) document decisions before code
- Task lists (`specs/<feature>/tasks.md`) break down work into testable units
- NO manual coding outside the SDD process
- Changes to requirements MUST update specs first

**Rationale**: Prevents scope creep, ensures traceability, enables async collaboration, and maintains a single source of truth for requirements.

### II. Authentication & Authorization

**MANDATORY**: Every API endpoint MUST enforce authentication:
- Better Auth (frontend) issues JWT tokens
- FastAPI backend validates JWT on every request using shared secret
- JWT secret stored in `.env` files (NEVER hardcoded)
- Unauthorized requests return 401/403 with clear error messages
- All authentication logic centralized in middleware/dependencies

**Rationale**: Protects user data, prevents unauthorized access, and ensures security compliance from day one.

### III. Task Ownership & Data Isolation

**MANDATORY**: Users may ONLY access their own tasks:
- Every task record MUST include `user_id` foreign key
- All queries MUST filter by authenticated user's ID
- Backend MUST validate ownership before read/update/delete
- API responses MUST NOT leak other users' data
- Database constraints MUST enforce user-task relationships

**Rationale**: Multi-tenant data integrity, privacy compliance, and prevents data leakage bugs.

### IV. Environment-Based Configuration

**MANDATORY**: All secrets and environment-specific values MUST use environment variables:
- `.env` files for local development (NEVER committed)
- `.env.example` documents required variables
- Production secrets managed via secure vault/service
- Database URLs, JWT secrets, API keys MUST be env vars
- Code MUST fail fast if required env vars missing

**Rationale**: Prevents credential leaks, supports multiple environments, and follows 12-factor app principles.

### V. Clean Code Standards

**MANDATORY**: Code MUST follow established standards:
- **Python (Backend)**: PEP 8, type hints required, docstrings for public APIs
- **TypeScript (Frontend)**: Idiomatic Next.js patterns, ESLint compliance
- **SQL**: Proper indexing on foreign keys and frequently queried fields
- **Naming**: Descriptive, consistent (snake_case Python, camelCase TypeScript)
- **No dead code**: Remove unused imports, commented code, debug statements

**Rationale**: Maintains readability, reduces bugs, enables team scalability, and eases onboarding.

### VI. Monorepo Structure

**MANDATORY**: Project structure MUST follow Spec-Kit Plus conventions:
```
/specs/          - Feature specs (spec.md, plan.md, tasks.md)
/history/        - ADRs and prompt history records
  /prompts/      - Organized by constitution/feature/general
  /adr/          - Architecture Decision Records
/frontend/       - Next.js 16+ App Router application (SEPARATE folder)
/backend/        - FastAPI application with SQLModel (SEPARATE folder)
/.specify/       - Templates, scripts, constitution
/.claude/         - Skills and agents configuration
  /skills/        - Claude Code skills (context7, browsing-with-playwright, spec-validation)
  /agents/        - Specialized agents (frontend-spec-implementer, backend-auth-guardian, spec-authority)
```

**Rationale**: Predictable structure, enforces separation of concerns, supports tooling, and enables Spec-Kit automation.

### VII. Documentation & Traceability

**MANDATORY**: Significant decisions and work MUST be recorded:
- **Prompt History Records (PHRs)**: Created after every user input via `/sp.phr`
- **Architecture Decision Records (ADRs)**: Created for architecturally significant decisions via `/sp.adr`
- **PHR Routing**: constitution → `history/prompts/constitution/`, features → `history/prompts/<feature-name>/`, general → `history/prompts/general/`
- **ADRs**: Stored in `history/adr/` with status (proposed/accepted/deprecated/superseded)
- **Inline Comments**: Only where business logic is non-obvious

**Rationale**: Preserves context, enables knowledge transfer, supports auditing, and prevents repeated mistakes.

### VIII. Skills & Agents Usage

**MANDATORY**: Specialized tools MUST be used when appropriate:

**Skills (Located in `.claude/skills/`)**:
- **context7-efficient**: MUST use for library documentation needs (fetching code examples, API references, best practices for JavaScript, Python, Go, Rust, etc.) when user asks about library docs, code examples, API usage, or learning new frameworks
- **browsing-with-playwright**: MUST use for web browsing, form submission, web scraping, or UI testing tasks when static content retrieval is insufficient
- **spec-validation**: MUST use to validate Phase II specifications BEFORE moving from specification to planning or implementation (ensures completeness, testability, and requirement fulfillment)
- **Other skills**: Use project-specific skills as defined in `.claude/skills/` when applicable to the task

**Agents (Located in `.claude/agents/`)**:
- **spec-authority**: MUST use when transitioning from design to implementation or when user requests code changes without finalized specification. Acts as gatekeeper to ensure Spec-Driven Development (SDD) process is strictly followed.
- **frontend-spec-implementer**: MUST use to implement or update UI components and pages using Next.js App Router based on technical specifications, especially when secure API integration and JWT handling are required.
- **backend-auth-guardian**: MUST use when developing or refactoring FastAPI routes, SQLModel schemas, or authentication logic. Ensures user ownership enforcement, JWT validation, and proper database session handling.

**Usage Principles**:
- Skills and agents SHOULD be invoked proactively when their specific capabilities match the task requirements
- Skills are for specialized tool execution; agents are for autonomous, multi-step workflows
- All skills/agents MUST be used in accordance with their documented purpose and scope
- When implementing features, use spec-authority first if specs are incomplete or outdated

**Rationale**: Leverages specialized capabilities for better efficiency, enforces consistent patterns across frontend/backend development, ensures security and data isolation through dedicated agents, and maintains Spec-Driven Development integrity.

## Security Requirements

**API Security**:
- HTTPS only in production
- CORS configured with explicit origins (no `*` wildcard)
- Input validation on all endpoints (Pydantic models)
- SQL injection prevention via SQLModel ORM (no raw SQL)
- Rate limiting on authentication endpoints

**Frontend Security**:
- XSS prevention via React's default escaping
- CSRF protection via SameSite cookies
- Secure token storage (httpOnly cookies preferred over localStorage)
- No sensitive data in client-side code or logs

**Database Security**:
- Connection strings in environment variables only
- Principle of least privilege for database users
- Regular backups configured
- Sensitive fields (if any) encrypted at rest

## Development Workflow

**Feature Development**:
1. Create/update spec: `/sp.specify <feature-name>`
2. Validate spec completeness: `/spec-validation` (MANDATORY before planning)
3. Create architecture plan: `/sp.plan <feature-name>`
4. Generate tasks: `/sp.tasks <feature-name>`
5. Implement backend using `backend-auth-guardian` agent when adding API endpoints or authentication logic
6. Implement frontend using `frontend-spec-implementer` agent when building UI components with API integration
7. Test integration end-to-end (use `browsing-with-playwright` for UI testing as needed)
8. Create PHR: `/sp.phr` (automatic after completion)
9. If architecturally significant decisions made, create ADR: `/sp.adr <title>`

**Documentation Research**:
- When researching library documentation, use `context7-efficient` skill for efficient token usage
- When needing code examples, API references, or framework patterns, use `context7-efficient`

**Code Changes**:
- MUST reference spec before implementation (use `spec-authority` if spec is incomplete)
- MUST be testable (unit tests for backend, component tests for frontend)
- MUST pass linting (PEP 8, ESLint)
- MUST include migration scripts for database schema changes
- MUST update relevant specs if requirements change

**Review & Merge**:
- All changes via pull requests (no direct commits to main)
- PR descriptions reference spec/task/ADR
- CI checks MUST pass (tests, linting, build)
- At least one approval required (for team environments)

## Architecture Standards

**Backend (FastAPI)**:
- RESTful API design with consistent resource naming
- Pydantic models for request/response validation
- SQLModel for ORM (declarative models)
- Dependency injection for database sessions and auth
- Structured error responses with detail messages
- Use `backend-auth-guardian` agent when creating/modifying routes, schemas, or auth logic

**Frontend (Next.js)**:
- App Router (not Pages Router)
- Server Components by default, Client Components only when needed
- API calls via fetch with proper error handling
- Better Auth for authentication flows
- TypeScript strict mode enabled
- Use `frontend-spec-implementer` agent when building UI components with secure API integration

**Database (Neon PostgreSQL)**:
- SQLModel declarative models as source of truth
- Alembic migrations for schema changes (if needed)
- Foreign key constraints enforced
- Indexes on user_id and frequently queried fields
- Connection pooling configured for serverless

**Testing**:
- Backend: pytest for unit/integration tests
- Frontend: Jest + React Testing Library
- E2E: Playwright via `browsing-with-playwright` skill (optional, for critical flows)
- Minimum 70% code coverage for business logic

## Governance

**Constitution Authority**:
- This constitution supersedes all conflicting practices
- All PRs MUST comply with these principles
- Violations require documented justification + approval
- Amendments require ADR, approval, and version bump

**Amendment Process**:
1. Identify need for amendment with rationale
2. Create ADR documenting proposed change
3. Update constitution template
4. Increment version (MAJOR: breaking changes, MINOR: additions, PATCH: clarifications)
5. Validate dependent templates and update
6. Create PHR documenting the amendment

**Version Semantics**:
- **MAJOR**: Backward-incompatible governance changes (e.g., removing a principle)
- **MINOR**: New principles or materially expanded guidance
- **PATCH**: Clarifications, wording fixes, non-semantic updates

**Compliance**:
- All team members MUST read and acknowledge constitution
- Constitution checks integrated into CI/CD where feasible
- Regular reviews (quarterly) to ensure relevance
- Use `.specify/memory/constitution.md` for project guidance
- Use `CLAUDE.md` (or agent-specific files) for runtime development guidance

**Version**: 1.1.0 | **Ratified**: 2026-01-01 | **Last Amended**: 2026-01-01
