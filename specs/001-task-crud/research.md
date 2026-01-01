# Technology Research: Multi-User Task Management Application

**Feature Branch**: `001-task-crud`
**Created**: 2026-01-01
**Status**: Phase 0 Complete
**Purpose**: Validate technology choices and establish implementation patterns for authentication, database, API, and frontend integration.

---

## Executive Summary

This research document validates the technology stack choices and establishes implementation patterns for building a secure, multi-user task management web application. All decisions align with the project constitution and functional requirements defined in `@specs/001-task-crud/spec.md`.

### Technology Stack Confirmed

| Component | Technology | Status |
|-----------|------------|--------|
| Frontend Framework | Next.js 16 App Router | ✅ Validated |
| Authentication (Frontend) | Better Auth (JWT tokens) | ⚠️  Limited Docs Available |
| Backend Framework | FastAPI | ✅ Validated |
| ORM | SQLModel | ✅ Validated |
| Database | Neon Serverless PostgreSQL | ✅ Validated |
| JWT Algorithm | HS256 (with Argon2 password hashing) | ✅ Validated |

### Key Findings

1. **Better Auth**: Documentation is limited; implementation will require direct GitHub repo research or community examples. Alternative: Build custom JWT auth layer if Better Auth proves too complex.
2. **FastAPI + SQLModel**: Well-documented, excellent for multi-user isolation via dependency injection.
3. **Neon PostgreSQL**: Serverless driver with connection pooling required for Python/SQLModel integration.
4. **JWT Strategy**: HS256 with strong secret management and Argon2 password hashing recommended for initial scope.
5. **Next.js Patterns**: Server Components for data fetching, client-side fetch wrapper for API calls with JWT attachment.

---

## 1. Better Auth with Next.js 16 App Router

### Decision
**Preliminary Decision**: Use Better Auth for Next.js 16 App Router integration with JWT tokens and httpOnly cookies.

### Rationale
- Framework-agnostic, universal authentication for TypeScript
- Built-in support for httpOnly cookies (secure token storage)
- JWT token management with automatic refresh
- Reduces boilerplate for common auth flows (register, login, logout)
- Community adoption and active development

### Alternatives Considered
| Alternative | Pros | Cons | Rejected Because |
|-------------|------|------|------------------|
| **NextAuth.js** | Mature, extensive docs | Heavier dependency, more config | Better Auth is lighter and more modern |
| **Custom JWT Auth** | Full control | More boilerplate, security risk if not perfect | Time-to-market slower |
| **Supabase Auth** | Backend included | Vendor lock-in, overkill for simple app | Want control over backend |

### Implementation Patterns (Based on Available Info)

#### JWT Token Issuance and Storage
```typescript
// Expected Better Auth pattern (to be validated)
import { auth } from "@/lib/auth"

// Login - returns JWT token in httpOnly cookie
await auth.signIn.email({
  email,
  password,
})

// Token stored automatically in httpOnly cookie (not accessible to JS)
// Frontend extracts token from cookie for API calls
```

#### httpOnly Cookie Configuration
- **Recommended**: `httpOnly: true` (prevents XSS access)
- **Secure**: `secure: true` in production (HTTPS only)
- **SameSite**: `strict` or `lax` (prevents CSRF)
- **MaxAge**: Configurable (e.g., 7 days for session, 15 minutes for access token)

#### Authentication Providers Setup
For initial scope, only email/password auth is required. Better Auth supports OAuth providers (Google, GitHub) but not in MVP.

### Potential Pitfalls and Concerns

1. **Documentation Scarcity**: Limited official documentation for Next.js 16 App Router integration patterns.
   - **Mitigation**: Research Better Auth GitHub repository, community examples, and open issues.

2. **Token Extraction for API Calls**: httpOnly cookies are not accessible to client-side JavaScript.
   - **Mitigation**: Use server-side API routes (middleware) to extract token and forward to FastAPI backend.

3. **Cross-Subdomain Sharing**: If frontend and backend are on different domains, cookie sharing requires careful CORS configuration.
   - **Mitigation**: Keep frontend and backend on same domain in production (use path-based routing: `/api/backend`).

4. **Token Refresh UX**: If access tokens expire, users may experience interrupted sessions.
   - **Mitigation**: Implement transparent token refresh in API client, or use long-lived session tokens (simpler for MVP).

### Recommended Implementation Approach

Given limited documentation, consider **hybrid approach**:
1. Use Better Auth for Next.js route protection and session management
2. Extract JWT token via server-side middleware for API calls
3. Implement custom API client wrapper that handles token attachment and refresh

**Fallback**: If Better Auth proves too complex, build lightweight JWT auth layer using `jose` or `jsonwebtoken` directly.

---

## 2. FastAPI + SQLModel Patterns

### Decision
**Use SQLModel with FastAPI dependency injection for multi-user data isolation and database session management.**

### Rationale
- **SQLModel**: Combines SQLAlchemy (ORM) + Pydantic 2 (validation) = single source of truth
- **FastAPI Native**: Built by same author (Tiangolo), seamless integration
- **Type Safety**: IDE-friendly, auto-completion, compile-time checks
- **Multi-User Isolation**: Dependency injection enables per-request user context injection
- **Simplicity**: Less boilerplate than separate ORM + Pydantic models

### Alternatives Considered
| Alternative | Pros | Cons | Rejected Because |
|-------------|------|------|------------------|
| **SQLAlchemy Alone** | Mature, extensive docs | No auto Pydantic schemas | SQLModel provides better developer experience |
| **Django ORM** | Feature-rich | Heavy, tied to Django framework | Wrong framework choice |
| **Tortoise ORM** | Async-first | Smaller ecosystem | SQLModel has better FastAPI integration |

### Implementation Patterns

#### Multi-User Data Isolation

```python
# models/task.py - SQLModel Task model
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional
from datetime import datetime

class Task(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)  # Foreign key for isolation
    title: str = Field(max_length=200)
    description: Optional[str] = Field(default=None, max_length=2000)
    completed: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = Field(default=None)

    # Relationship to User (optional, for joined queries)
    user: "User" = Relationship(back_populates="tasks")
```

**Key Pattern**: `user_id` foreign key with index ensures fast queries and enforces ownership.

#### Dependency Injection for Database Sessions

```python
# api/dependencies.py - FastAPI dependencies
from fastapi import Depends, HTTPException, status
from sqlmodel import Session, select
from typing import Annotated

from core.database import get_session
from core.security import get_current_user
from models.user import User

# Database session dependency
SessionDep = Annotated[Session, Depends(get_session)]

# Authenticated user dependency
CurrentUserDep = Annotated[User, Depends(get_current_user)]

# Usage in endpoints:
from fastapi import APIRouter, Depends

router = APIRouter(prefix="/api/tasks", tags=["tasks"])

@router.get("/")
async def list_tasks(
    session: SessionDep,  # Auto-injected DB session
    current_user: CurrentUserDep,  # Auto-injected authenticated user
):
    # Multi-user isolation: filter by current_user.id
    tasks = session.exec(
        select(Task)
        .where(Task.user_id == current_user.id)
        .order_by(Task.completed, Task.created_at)
    ).all()
    return tasks
```

**Key Pattern**: `CurrentUserDep` injects authenticated user, ensuring all operations are scoped to that user.

#### Pydantic Model Validation with SQLModel

```python
# models/task.py - Pydantic schemas for API
from sqlmodel import SQLModel
from typing import Optional

class TaskCreate(SQLModel):
    title: str
    description: Optional[str] = None

class TaskUpdate(SQLModel):
    title: Optional[str] = None
    description: Optional[str] = None

class TaskRead(SQLModel):
    id: int
    user_id: int
    title: str
    description: Optional[str]
    completed: bool
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime]

# API endpoint with validation
@router.post("/", response_model=TaskRead)
async def create_task(
    task: TaskCreate,  # Pydantic validates input automatically
    session: SessionDep,
    current_user: CurrentUserDep,
):
    db_task = Task.model_validate(task)
    db_task.user_id = current_user.id  # Enforce ownership
    session.add(db_task)
    session.commit()
    session.refresh(db_task)
    return db_task
```

**Key Pattern**: Separate models for Create/Update/Read, with automatic Pydantic validation.

#### Database Session Management

```python
# core/database.py - Session management
from sqlmodel import create_engine, Session
from typing import Generator

# Neon PostgreSQL connection string
DATABASE_URL = "postgresql://user:pass@host/dbname?sslmode=require&channel_binding=require"

# Create engine with connection pooling
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,  # Check connection health before use (critical for serverless)
    pool_recycle=3600,    # Recycle connections after 1 hour (matches Neon scale-to-zero timeout)
    echo=False,           # Set to True for debugging SQL queries
)

# Dependency to get session
def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session
```

**Key Pattern**: `pool_pre_ping=True` prevents stale connection errors in serverless environments.

### Potential Pitfalls and Concerns

1. **Stale Connections in Serverless**: Neon's auto-suspend can close connections, causing SSL errors.
   - **Mitigation**: `pool_pre_ping=True`, `pool_recycle=3600` (matches Neon's 5-minute idle timeout).

2. **Transaction Rollback**: Errors must be handled to avoid partial commits.
   - **Mitigation**: Use FastAPI's automatic rollback on exception, or explicit `session.rollback()`.

3. **N+1 Query Problem**: Loading related models inefficiently.
   - **Mitigation**: Use `selectinload()` or `joinedload()` for eager loading (if relationships are added).

4. **Migration Strategy**: SQLModel doesn't have built-in migrations.
   - **Mitigation**: Use Alembic for database migrations (standard for SQLAlchemy/SQLModel).

---

## 3. Neon PostgreSQL Serverless

### Decision
**Use Neon Serverless PostgreSQL with connection pooling configured for serverless workloads.**

### Rationale
- **Serverless Architecture**: Auto-scales, no always-on instance required (cost-effective for MVP)
- **Free Tier**: Generous free tier for development
- **PostgreSQL-Compatible**: No vendor lock-in, can migrate to standard PostgreSQL later
- **Connection Pooling**: Built-in pooling for serverless applications (critical for performance)
- **Instant Branching**: Development database branching (useful for testing)

### Alternatives Considered
| Alternative | Pros | Cons | Rejected Because |
|-------------|------|------|------------------|
| **AWS RDS PostgreSQL** | Fully managed, robust | Always-on instance (costly), slower cold starts | Neon is cheaper for low-traffic MVP |
| **Supabase PostgreSQL** | Free tier, managed | Vendor lock-in (ties to Supabase auth) | Want control over auth layer |
| **SQLite** | Simple, file-based | No multi-user isolation, not production-ready | Fails FR-014 (user isolation) |

### Implementation Patterns

#### Connection String Format
```bash
# .env file
DATABASE_URL="postgresql://username:password@ep-cool-cloud-123456.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
```

**Parameters**:
- `sslmode=require`: Enforce SSL (required for Neon)
- `channel_binding=require`: Additional security for connection authentication

#### Connection Pooling Configuration

```python
# core/database.py - SQLAlchemy engine configuration
from sqlmodel import create_engine

engine = create_engine(
    DATABASE_URL,
    # Critical for serverless workloads:
    pool_pre_ping=True,      # Check connection health before use
    pool_recycle=3600,       # Recycle connections after 1 hour (Neon scale-to-zero: 5 min)
    pool_size=5,             # Max connections in pool (adjust based on load)
    max_overflow=10,         # Additional connections when pool exhausted
)
```

**Why These Settings?**:
- `pool_pre_ping=True`: Prevents "SSL connection closed unexpectedly" errors (common in serverless)
- `pool_recycle=3600`: Recycles connections before Neon's 5-minute idle timeout kills them
- `pool_size=5` + `max_overflow=10`: Supports up to 15 concurrent requests (sufficient for MVP)

#### Environment-Based Configuration

```python
# core/config.py - Environment configuration
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    database_url: str
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    environment: str = "development"

    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()
```

**Usage**:
```python
from core.config import settings

engine = create_engine(settings.database_url)
```

### Best Practices with SQLModel and Neon

1. **Always use `pool_pre_ping=True`**: Prevents stale connection errors in serverless.
2. **Set `pool_recycle` < Neon's scale-to-zero timeout**: Default is 5 minutes, so 3600 seconds is safe.
3. **Use SSL in connection string**: Neon requires `sslmode=require`.
4. **Index foreign keys**: `user_id` and `created_at` indexed for fast queries.
5. **Upgrade SQLAlchemy**: Use SQLAlchemy 2.0.33+ (fixes idle connection reuse issues).

### Potential Pitfalls and Concerns

1. **Cold Start Latency**: First request after idle time has ~500ms latency (Neon spins up compute).
   - **Mitigation**: Use connection pooling (reduces cold starts), or keep-warm ping if needed.

2. **Connection Exhaustion**: Too many concurrent requests can exhaust Neon's connection limits.
   - **Mitigation**: Configure pool size appropriately, implement rate limiting.

3. **Migration Complexity**: Migrating from Neon to standard PostgreSQL requires connection string change only (easy).
   - **Mitigation**: No vendor lock-in due to PostgreSQL compatibility.

4. **Data Persistence**: Neon provides backups, but verify backup frequency (not documented in research).
   - **Mitigation**: Implement application-level data exports if needed.

---

## 4. JWT Verification Patterns

### Decision
**Use HS256 algorithm with strong secret management, Argon2 password hashing, and short-lived access tokens with optional refresh tokens.**

### Rationale
- **HS256 (HMAC-SHA256)**: Simpler than RS256 (no public/private key pair management), secure with strong secret
- **Argon2 Password Hashing**: State-of-the-art password hashing (resistant to GPU attacks)
- **Short-Lived Tokens**: Reduces window of opportunity if token is compromised
- **Stateless Authentication**: No server-side session store (scales horizontally)

### Alternatives Considered

#### HS256 vs RS256 Algorithm Comparison

| Algorithm | Type | Secret Management | Performance | Use Case |
|-----------|------|-------------------|-------------|----------|
| **HS256** | Symmetric (HMAC) | Single shared secret | Faster | Single backend service |
| **RS256** | Asymmetric (RSA) | Public/private key pair | Slower | Multiple microservices, third-party token verification |

**Decision**: HS256 for initial scope (single backend service). Switch to RS256 if architecture evolves to multiple microservices.

**Rationale**:
- Simpler secret management (one shared secret between Better Auth and FastAPI)
- Faster verification (no RSA crypto overhead)
- Sufficient for single-service architecture

### Implementation Patterns

#### Secret Management

```python
# core/config.py
from pydantic_settings import BaseSettings
import secrets

class Settings(BaseSettings):
    # Generate with: openssl rand -hex 32 (32 bytes = 256 bits)
    jwt_secret: str

    # Validate secret strength
    @validator("jwt_secret")
    def validate_jwt_secret(cls, v):
        if len(v) < 32:
            raise ValueError("JWT secret must be at least 32 characters")
        return v

    class Config:
        env_file = ".env"
```

**Best Practices**:
- Generate secret with `openssl rand -hex 32` (256 bits of entropy)
- Store in `.env` file (never commit to git)
- Rotate secret periodically (every 90 days recommended)
- Use separate secrets for dev/staging/prod

#### Token Creation (Backend)

```python
# core/security.py
from datetime import datetime, timedelta, timezone
from jose import jwt
from core.config import settings

SECRET_KEY = settings.jwt_secret
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
```

**Token Payload Example**:
```json
{
  "sub": "user:123",  // Subject: user ID with prefix
  "exp": 1234567890   // Expiration timestamp
}
```

#### Token Verification (FastAPI Dependency)

```python
# core/security.py
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlmodel import Session, select

from core.database import get_session
from models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    session: Session = Depends(get_session),
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id_str = payload.get("sub")
        if user_id_str is None:
            raise credentials_exception

        # Extract user ID from "user:123" format
        user_id = int(user_id_str.split(":")[1])
    except (JWTError, ValueError, IndexError):
        raise credentials_exception

    user = session.exec(select(User).where(User.id == user_id)).first()
    if user is None:
        raise credentials_exception

    return user
```

**Key Pattern**: Dependency injection pattern `get_current_user()` enforces authentication on all protected endpoints.

#### Password Hashing with Argon2

```python
# core/security.py
from pwdlib import PasswordHash

password_hash = PasswordHash.recommended()  # Uses Argon2 by default

def hash_password(password: str) -> str:
    """Hash password with Argon2."""
    return password_hash.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash."""
    return password_hash.verify(plain_password, hashed_password)
```

**Install**: `pip install "pwdlib[argon2]"`

**Example Hash**: `$argon2id$v=19$m=65536,t=3,p=4$...`

### Token Expiration and Refresh Strategies

#### Strategy 1: Long-Lived Session Tokens (Simple - Recommended for MVP)

```python
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

# User stays logged in for 7 days
# On expiration, user must re-login
```

**Pros**: Simple, no refresh token logic required
**Cons**: Less secure if token is compromised

#### Strategy 2: Short-Lived Access + Long-Lived Refresh (More Secure)

```python
ACCESS_TOKEN_EXPIRE_MINUTES = 15  # 15 minutes
REFRESH_TOKEN_EXPIRE_DAYS = 30     # 30 days

def create_refresh_token(user_id: int) -> str:
    """Create long-lived refresh token."""
    data = {"sub": f"user:{user_id}", "type": "refresh"}
    expires_delta = timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    return create_access_token(data, expires_delta)

# Endpoint to refresh access token
@app.post("/api/auth/refresh")
async def refresh_token(refresh_token: str, session: SessionDep):
    # Verify refresh token, issue new access token
    ...
```

**Pros**: More secure, short-lived access tokens
**Cons**: More complex, requires refresh token storage in database

**Decision**: Use Strategy 1 (7-day tokens) for MVP, implement Strategy 2 if security audit requires.

### FastAPI JWT Verification Middleware Patterns

#### Option 1: Dependency Injection (Recommended)

```python
# api/tasks.py - Protected endpoint
@router.get("/")
async def list_tasks(
    current_user: User = Depends(get_current_user),  # Auto-inject user
    session: Session = Depends(get_session),
):
    # User is guaranteed to be authenticated
    tasks = session.exec(
        select(Task).where(Task.user_id == current_user.id)
    ).all()
    return tasks
```

#### Option 2: Middleware (Global Enforcement)

```python
# main.py - Global auth middleware
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Whitelist for public routes (e.g., login, register)
PUBLIC_ROUTES = {"/api/auth/register", "/api/auth/login"}

@app.middleware("http")
async def verify_jwt_middleware(request: Request, call_next):
    if request.url.path in PUBLIC_ROUTES:
        return await call_next(request)

    # Extract token from Authorization header
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")

    token = auth_header.split(" ")[1]
    try:
        # Verify token and attach user to request state
        user = await verify_token_and_get_user(token)
        request.state.user = user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    return await call_next(request)
```

**Decision**: Use Option 1 (Dependency Injection) - more flexible, allows public routes without middleware exceptions.

### Potential Pitfalls and Concerns

1. **Token Theft**: If token is stolen (XSS), attacker can impersonate user for 7 days.
   - **Mitigation**: httpOnly cookies (prevents XSS access), rotate secrets periodically.

2. **Secret in Environment Variable**: If `.env` file is committed, secret is exposed.
   - **Mitigation**: Add `.env` to `.gitignore`, use environment variables in production.

3. **Token Expiration UX**: Users may lose work if token expires mid-operation.
   - **Mitigation**: Use long-lived tokens (7 days), show clear error message on 401.

4. **Algorithm Confusion Attack**: Attacker could trick server into using none algorithm.
   - **Mitigation**: Explicitly specify `algorithms=[ALGORITHM]` in `jwt.decode()`.

---

## 5. Next.js 16 API Client Patterns

### Decision
**Use Server Components for data fetching by default, client-side fetch wrapper for authenticated API calls with JWT token attachment and robust error handling.**

### Rationale
- **Server Components**: Default in Next.js 16, secure database access, faster first paint
- **Fetch Wrapper**: Centralized API client logic, automatic token attachment, consistent error handling
- **React Patterns**: Hooks for state management (`useState`, `useEffect`) for client components
- **Error Handling**: Graceful UX for 401 (unauthorized), 403 (forbidden), 422 (validation), and 500 (server error)

### Alternatives Considered
| Alternative | Pros | Cons | Rejected Because |
|-------------|------|------|------------------|
| **axios** | Interceptors, mature | Additional dependency, larger bundle | Fetch is native and sufficient |
| **SWR / React Query** | Caching, optimistic updates | Overkill for simple CRUD, adds complexity | Fetch wrapper is simpler for MVP |
| **tRPC** | End-to-end type safety | Requires backend refactor | Backend is FastAPI (not tRPC) |

### Implementation Patterns

#### Fetch Wrapper for Authenticated Requests

```typescript
// frontend/src/lib/api.ts - Centralized API client
import { cookies } from 'next/headers'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

/**
 * Helper to extract JWT token from httpOnly cookie
 * Must be called from server component or route handler
 */
async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get('better-auth.session_token')?.value || null
}

/**
 * Authenticated fetch wrapper
 * Automatically attaches JWT token and handles errors
 */
export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`

  // Attach JWT token to Authorization header
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(url, { ...options, headers })

  // Handle error responses
  if (!response.ok) {
    const error = await response.json()
    throw new ApiError(response.status, error.detail || 'Request failed')
  }

  return response.json()
}

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * API client methods (typed)
 */
export const api = {
  // Auth
  login: (email: string, password: string) =>
    apiFetch<{ access_token: string; token_type: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: email, password }),
    }),

  register: (email: string, password: string) =>
    apiFetch<{ id: number; email: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  // Tasks
  listTasks: (token: string) =>
    apiFetch<Task[]>('/tasks', { token }),

  createTask: (task: TaskCreate, token: string) =>
    apiFetch<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
      token,
    }),

  updateTask: (id: number, task: TaskUpdate, token: string) =>
    apiFetch<Task>(`/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(task),
      token,
    }),

  toggleTask: (id: number, token: string) =>
    apiFetch<Task>(`/tasks/${id}/toggle`, {
      method: 'PATCH',
      token,
    }),

  deleteTask: (id: number, token: string) =>
    apiFetch<void>(`/tasks/${id}`, {
      method: 'DELETE',
      token,
    }),
}
```

#### JWT Token Attachment to Requests

**Challenge**: httpOnly cookies are not accessible to client-side JavaScript.

**Solution**: Use server components and route handlers to extract token, pass to client components via props or server actions.

**Option 1: Server Component (Recommended for Data Fetching)**

```typescript
// frontend/src/app/dashboard/page.tsx - Server component
import { apiFetch } from '@/lib/api'
import { getAuthToken } from '@/lib/api'

export default async function DashboardPage() {
  const token = await getAuthToken()

  if (!token) {
    redirect('/login')  // Redirect if not authenticated
  }

  const tasks = await apiFetch<Task[]>('/tasks', { token })

  return <TaskList tasks={tasks} token={token} />
}
```

**Option 2: Route Handler (For Client Component API Calls)**

```typescript
// frontend/src/app/api/tasks/route.ts - API route handler
import { NextResponse } from 'next/server'
import { getAuthToken } from '@/lib/api'

export async function GET(request: Request) {
  const token = await getAuthToken()

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Forward request to FastAPI backend
  const response = await fetch(`${process.env.API_URL}/tasks`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  return NextResponse.json(await response.json())
}
```

**Option 3: Server Actions (Next.js 13+)**

```typescript
// frontend/src/app/actions/tasks.ts - Server actions
'use server'

import { revalidatePath } from 'next/cache'
import { apiFetch } from '@/lib/api'
import { getAuthToken } from '@/lib/api'

export async function createTask(task: TaskCreate) {
  const token = await getAuthToken()
  const newTask = await apiFetch<Task>('/tasks', {
    method: 'POST',
    body: JSON.stringify(task),
    token,
  })

  revalidatePath('/dashboard')  // Revalidate cache
  return newTask
}
```

#### Error Handling Best Practices

```typescript
// frontend/src/components/TaskList.tsx - Client component
'use client'

import { useState, useEffect } from 'react'
import { api, ApiError } from '@/lib/api'

interface TaskListProps {
  initialTasks: Task[]
  token: string
}

export function TaskList({ initialTasks, token }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleDelete = async (taskId: number) => {
    setLoading(true)
    setError(null)

    try {
      await api.deleteTask(taskId, token)
      setTasks(tasks.filter(t => t.id !== taskId))
    } catch (err) {
      if (err instanceof ApiError) {
        // Handle specific error codes
        switch (err.status) {
          case 401:
            setError('Session expired. Please log in again.')
            redirect('/login')
            break
          case 403:
            setError('You do not have permission to delete this task.')
            break
          case 404:
            setError('Task not found.')
            break
          case 422:
            setError('Invalid request data.')
            break
          default:
            setError('An unexpected error occurred.')
        }
      } else {
        setError('Failed to delete task. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {error && <div className="error">{error}</div>}
      <ul>
        {tasks.map(task => (
          <TaskItem key={task.id} task={task} onDelete={handleDelete} />
        ))}
      </ul>
    </div>
  )
}
```

**Error Codes**:
- **401 Unauthorized**: Token missing, invalid, or expired → Redirect to login
- **403 Forbidden**: User lacks permission → Show error message
- **404 Not Found**: Resource doesn't exist → Show error message
- **422 Unprocessable Entity**: Validation error → Show specific field errors
- **500 Internal Server Error**: Server error → Show generic error, retry button

#### React Patterns for State Management

**Pattern 1: Server Components (Default)**

```typescript
// Use server components for initial data fetch
export default async function Page() {
  const token = await getAuthToken()
  const tasks = await api.listTasks(token)

  return <TaskList tasks={tasks} token={token} />
}
```

**Pattern 2: Client Components with useState/useEffect**

```typescript
// Use client components for interactivity (forms, real-time updates)
'use client'

import { useState, useEffect } from 'react'

export function TaskForm({ token }: { token: string }) {
  const [title, setTitle] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    await api.createTask({ title }, token)
    setTitle('')
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="New task..."
      />
      <button type="submit">Add Task</button>
    </form>
  )
}
```

**Pattern 3: Server Actions (Next.js 13+)**

```typescript
// Use server actions for mutations (create, update, delete)
import { createTask } from '@/app/actions/tasks'

export function TaskForm() {
  async function handleSubmit(formData: FormData) {
    'use server'
    const title = formData.get('title') as string
    await createTask({ title })
  }

  return (
    <form action={handleSubmit}>
      <input name="title" placeholder="New task..." />
      <button type="submit">Add Task</button>
    </form>
  )
}
```

**Recommended**: Use server components for initial data, server actions for mutations, client components for interactivity.

### Potential Pitfalls and Concerns

1. **Token Access in Client Components**: httpOnly cookies prevent direct token access in client components.
   - **Mitigation**: Use server components and route handlers, or pass token via props.

2. **Type Safety Between Frontend and Backend**: TypeScript types must match backend Pydantic models.
   - **Mitigation**: Share types via generated code (e.g., `openapi-typescript` from OpenAPI spec), or manually sync.

3. **Error Message Exposure**: Backend error messages may leak sensitive information.
   - **Mitigation**: Generic error messages in production, detailed errors in dev.

4. **CORS Issues**: Frontend and backend on different domains cause CORS errors.
   - **Mitigation**: Configure CORS in FastAPI with explicit origins, or use same domain with path routing.

5. **Hydration Mismatch**: Server-rendered HTML differs from client-rendered HTML.
   - **Mitigation**: Ensure server and client render identical HTML, use `suppressHydrationWarning` if necessary.

---

## Implementation Recommendations

### Authentication Flow

1. **User Registration**:
   - Frontend: POST `/api/auth/register` (email, password)
   - Backend: Hash password with Argon2, create user in DB, return success

2. **User Login**:
   - Frontend: POST `/api/auth/login` (email, password)
   - Backend: Verify password, issue JWT token (7-day expiry), return token
   - Frontend: Store token in httpOnly cookie via Better Auth or custom middleware

3. **Authenticated API Calls**:
   - Frontend: Extract token from cookie (server-side), attach to `Authorization: Bearer <token>` header
   - Backend: Verify JWT, extract `user_id` from `sub` claim, inject into endpoint
   - Endpoint: Filter all queries by `user_id`, validate ownership

4. **Token Expiration**:
   - Frontend: On 401 error, redirect to `/login` with message "Session expired"
   - Backend: Return 401 for invalid/expired tokens

### Database Schema

```sql
-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tasks table
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description VARCHAR(2000),
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);
CREATE INDEX idx_tasks_user_completed ON tasks(user_id, completed, created_at);
```

**Key Points**:
- `user_id` foreign key with `ON DELETE CASCADE` (deletes tasks when user deleted)
- Indexes on `user_id`, `created_at`, and compound index for list queries
- Timestamps in UTC

### API Endpoint Summary

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login, return JWT |
| GET | `/api/tasks` | Yes | List user's tasks |
| POST | `/api/tasks` | Yes | Create task |
| GET | `/api/tasks/{id}` | Yes | Get task by ID |
| PATCH | `/api/tasks/{id}` | Yes | Update task |
| PATCH | `/api/tasks/{id}/toggle` | Yes | Toggle completion |
| DELETE | `/api/tasks/{id}` | Yes | Delete task |

**Error Codes**:
- 401: Unauthorized (missing/invalid token)
- 403: Forbidden (not task owner)
- 404: Not found (task doesn't exist)
- 422: Validation error (invalid input)

---

## Architecture Decision Records (ADRs) Recommended

Based on this research, the following significant architectural decisions warrant ADRs:

1. **JWT Authentication Strategy** (`/sp.adr jwt-authentication-strategy`)
   - Decision: HS256 with 7-day tokens (not refresh tokens)
   - Rationale: Simplicity vs security tradeoff for MVP

2. **SQLModel ORM Choice** (`/sp.adr sqlmodel-orm-choice`)
   - Decision: SQLModel over SQLAlchemy alone
   - Rationale: Single source of truth for DB + Pydantic models

3. **Neon PostgreSQL vs Standard PostgreSQL** (`/sp.adr neon-postgresql-choice`)
   - Decision: Neon serverless for cost-efficiency
   - Rationale: Free tier, auto-scaling, no always-on instance

4. **Better Auth vs Custom JWT Layer** (`/sp.adr better-auth-choice`)
   - **PENDING**: Requires more research into Better Auth docs
   - Rationale: Framework-agnostic auth vs custom implementation

**To create ADRs**, run: `/sp.adr <decision-title>`

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Better Auth integration complexity | Medium | High | Research GitHub repo, fallback to custom JWT if needed |
| Token theft (XSS) | Low | High | httpOnly cookies, rotate secrets |
| Stale database connections | Medium | Medium | `pool_pre_ping=True`, `pool_recycle=3600` |
| Cross-user data leakage | Medium | High | Backend ownership validation, comprehensive testing |
| CORS misconfiguration | Low | Medium | Explicit origin whitelist, testing |
| Neon cold start latency | Medium | Medium | Connection pooling, acceptable for MVP |
| Type safety drift | Medium | Medium | Sync types manually or use codegen from OpenAPI spec |

---

## Next Steps

1. **Validate Better Auth**: Research Better Auth GitHub repository, example projects, and Next.js 16 integration. If integration proves too complex, build custom JWT layer.

2. **Generate Data Model**: Create `@specs/001-task-crud/data-model.md` with detailed schema definitions.

3. **Generate API Contracts**: Create `@specs/001-task-crud/contracts/openapi.yaml` with OpenAPI 3.0 spec.

4. **Generate Tasks**: Run `/sp.tasks` to generate implementation tasks from this research and data model.

5. **Create ADRs**: Document significant decisions with `/sp.adr` for JWT strategy, SQLModel, and Neon choices.

---

## Sources

This research document is based on official documentation and best practices from the following sources:

- [FastAPI Security Documentation](https://fastapi.tiangolo.com/tutorial/security/) - OAuth2 with JWT tokens, password hashing, security schemes
- [Next.js 16 Data Fetching Documentation](https://nextjs.org/docs/app/building-your-application/data-fetching) - Server components, fetch patterns, streaming
- [SQLModel FastAPI Tutorial](https://sqlmodel.tiangolo.com/tutorial/fastapi/) - SQLModel integration patterns
- [Neon PostgreSQL Documentation](https://neon.com/docs) - Serverless database, connection pooling, SQLAlchemy integration
- [JWT.io](https://jwt.io/) - JWT interactive exploration and best practices
- [pwdlib Documentation](https://github.com/scaleshq/pwdlib) - Password hashing with Argon2
- [Better Auth Documentation](https://www.better-auth.com/docs) - Framework-agnostic authentication (limited docs available)

---

**Research Phase**: Complete ✅
**Next Phase**: Phase 1 - Design & Contracts
