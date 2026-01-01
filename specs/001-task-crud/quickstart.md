# Quickstart Guide: Multi-User Task Management Application

**Feature Branch**: `001-task-crud`
**Created**: 2026-01-01
**Status**: Phase 1 Complete
**Based on**: `@specs/001-task-crud/spec.md`, `@specs/001-task-crud/plan.md`

## Overview

This guide helps you set up the development environment for the Todo full-stack application. The application consists of:

- **Frontend**: Next.js 16+ App Router (TypeScript)
- **Backend**: FastAPI (Python 3.11+) with SQLModel ORM
- **Database**: Neon Serverless PostgreSQL

**Estimated setup time**: 10-15 minutes

---

## Prerequisites

### Required Software

1. **Node.js**: Version 20.x or higher
   - Check: `node --version`
   - Install: https://nodejs.org/

2. **Python**: Version 3.11 or higher
   - Check: `python --version`
   - Install: https://www.python.org/downloads/

3. **UV**: Python package manager (faster than pip)
   - Install: `pip install uv` (or `pipx install uv`)

4. **Git**: For version control
   - Check: `git --version`
   - Install: https://git-scm.com/

### Required Accounts

1. **Neon Database Account** (Free Tier)
   - Sign up: https://neon.tech/
   - Create a project and get connection string

---

## Repository Structure

```text
full-stack-todo-app/
├── frontend/              # Next.js 16 app
│   ├── src/
│   │   ├── app/         # App Router pages
│   │   ├── components/  # React components
│   │   └── lib/        # Utilities (API client, auth)
│   ├── .env.local       # Frontend environment variables
│   └── package.json
├── backend/              # FastAPI app
│   ├── src/
│   │   ├── models/      # SQLModel models
│   │   ├── api/         # API routes
│   │   └── core/        # Config, security, database
│   ├── tests/           # Pytest tests
│   ├── .env             # Backend environment variables
│   └── pyproject.toml   # UV configuration
├── specs/               # Spec-Kit Plus specifications
│   └── 001-task-crud/
│       ├── spec.md       # Feature specification
│       ├── plan.md      # Implementation plan
│       ├── research.md   # Technology research
│       ├── data-model.md # Database schema
│       ├── quickstart.md # This file
│       └── contracts/   # API contracts
└── .gitignore
```

---

## Environment Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd full-stack-todo-app
```

### 2. Backend Environment Variables

Create `.env` file in `backend/` directory:

```bash
# backend/.env

# Database connection (from Neon)
DATABASE_URL="postgresql://username:password@ep-cool-cloud-123456.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# JWT secret (generate with: openssl rand -hex 32)
JWT_SECRET="your-256-bit-jwt-secret-key-here"

# JWT algorithm
JWT_ALGORITHM="HS256"

# Access token expiration (in minutes)
ACCESS_TOKEN_EXPIRE_MINUTES="10080"  # 7 days

# Environment (development/staging/production)
ENVIRONMENT="development"
```

**Generate JWT Secret**:
```bash
openssl rand -hex 32
```

### 3. Frontend Environment Variables

Create `.env.local` file in `frontend/` directory:

```bash
# frontend/.env.local

# Backend API URL
NEXT_PUBLIC_API_URL="http://localhost:8000/api"

# Optional: Better Auth session configuration
# NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:3000/api/auth"
```

---

## Backend Setup

### 1. Install Dependencies

```bash
cd backend

# Install dependencies with UV
uv pip install fastapi uvicorn[standard] sqlmodel pydantic pydantic-settings python-jose[cryptography] passlib[bcrypt] pwdlib[argon2] python-multipart pytest pytest-asyncio httpx alembic

# Verify installation
uvicorn main:app --version
```

### 2. Initialize Database

```bash
# Run database migrations
alembic upgrade head
```

**Note**: If Alembic is not initialized, create initial migration:

```bash
alembic init alembic
alembic revision --autogenerate -m "Initial schema"
alembic upgrade head
```

### 3. Run Backend Server

```bash
# Development mode (auto-reload on changes)
uvicorn src.main:app --reload --port 8000

# Production mode
uvicorn src.main:app --host 0.0.0.0 --port 8000
```

**Backend URL**: http://localhost:8000

**API Docs**: http://localhost:8000/docs (FastAPI auto-generated Swagger UI)

---

## Frontend Setup

### 1. Install Dependencies

```bash
cd frontend

# Install dependencies with npm
npm install

# Or with yarn
yarn install
```

### 2. Run Frontend Server

```bash
# Development mode
npm run dev

# Or with yarn
yarn dev
```

**Frontend URL**: http://localhost:3000

---

## Testing the Application

### 1. Verify Backend

Open http://localhost:8000/docs in your browser. You should see FastAPI's interactive API documentation.

**Test Registration**:
1. Click on `POST /api/auth/register`
2. Click "Try it out"
3. Enter email and password
4. Click "Execute"
5. Verify 201 response with user data

**Test Login**:
1. Click on `POST /api/auth/login`
2. Click "Try it out"
3. Enter the same email and password
4. Click "Execute"
5. Copy the `access_token` from the response

**Test Protected Endpoint**:
1. Click on `GET /api/tasks`
2. Click "Authorize" button
3. Enter: `Bearer <your-access-token>`
4. Click "Authorize"
5. Click "Try it out"
6. Click "Execute"
7. Verify 200 response with empty task list (or existing tasks)

### 2. Verify Frontend

Open http://localhost:3000 in your browser. You should see the login/registration page.

**Test User Flow**:
1. Click "Register" link
2. Enter email and password, submit
3. Redirect to login page
4. Log in with your credentials
5. Redirect to dashboard with task list
6. Create a new task
7. Toggle task completion
8. Edit task
9. Delete task

---

## Common Development Commands

### Backend

```bash
# Run backend server (dev)
uvicorn src.main:app --reload

# Run backend server (prod)
uvicorn src.main:app --host 0.0.0.0 --port 8000

# Run tests
pytest

# Run tests with coverage
pytest --cov=src

# Create database migration
alembic revision --autogenerate -m "<description>"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1

# Check Python code style (optional: install ruff first)
ruff check src/
```

### Frontend

```bash
# Run frontend server (dev)
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Type checking
npm run type-check

# Linting
npm run lint

# Linting with auto-fix
npm run lint:fix
```

---

## Common Debugging Tasks

### Backend Issues

**1. Database Connection Error**

```
Error: connection to server at "ep-cool-cloud...", port 5432 failed
```

**Solution**:
- Check `DATABASE_URL` in `.env` is correct
- Verify Neon database is active (not suspended)
- Ensure `sslmode=require` is in connection string

**2. "SQLAlchemy not found" Error**

```bash
# Reinstall dependencies
uv pip install --force-reinstall sqlalchemy sqlmodel
```

**3. JWT Secret Not Set**

```
Error: JWT_SECRET not found in environment
```

**Solution**:
- Generate JWT secret: `openssl rand -hex 32`
- Add to `backend/.env`
- Restart backend server

**4. Alembic Migration Issues**

```bash
# Reset migrations (WARNING: deletes all data)
alembic downgrade base
alembic revision --autogenerate -m "Reset"
alembic upgrade head
```

### Frontend Issues

**1. API Connection Refused**

```
Error: fetch failed to connect to http://localhost:8000/api
```

**Solution**:
- Verify backend server is running (http://localhost:8000)
- Check `NEXT_PUBLIC_API_URL` in `frontend/.env.local`
- Ensure no firewall blocking port 8000

**2. TypeScript Build Errors**

```bash
# Reinstall node_modules
rm -rf node_modules package-lock.json
npm install

# Clear Next.js cache
rm -rf .next
npm run dev
```

**3. "Module not found" Errors**

```bash
# Verify file paths in imports
# Example: import should be '@/lib/api' (not '../../lib/api')
```

---

## Architecture Overview

### Backend Architecture

```
FastAPI Application (src/main.py)
│
├── Models (src/models/)
│   ├── user.py          # User SQLModel
│   └── task.py         # Task SQLModel
│
├── API Routes (src/api/)
│   ├── auth.py         # Register/login endpoints
│   ├── tasks.py        # Task CRUD endpoints
│   └── dependencies.py # JWT verification, DB session injection
│
└── Core (src/core/)
    ├── config.py       # Environment configuration
    ├── security.py     # JWT verification, password hashing
    └── database.py    # Database connection, session management
```

**Key Patterns**:
- **Dependency Injection**: `CurrentUserDep` injects authenticated user into endpoints
- **Multi-User Isolation**: All queries filter by `user_id`
- **Ownership Validation**: Backend verifies user owns task before update/delete

### Frontend Architecture

```
Next.js 16 App Router (src/app/)
│
├── Pages (src/app/)
│   ├── page.tsx              # Landing/login page
│   ├── dashboard/             # Protected dashboard
│   │   ├── page.tsx          # Task list
│   │   └── layout.tsx        # Dashboard layout
│   └── login/                # Login page
│
├── Components (src/components/)
│   ├── TaskList.tsx           # Task list component
│   ├── TaskItem.tsx           # Single task component
│   ├── TaskForm.tsx           # Create/edit form
│   └── auth/                 # Authentication components
│       ├── AuthProvider.tsx   # Better Auth provider
│       └── LoginForm.tsx      # Login form
│
└── Lib (src/lib/)
    ├── api.ts                 # API client (fetch wrapper)
    ├── types.ts               # TypeScript types
    └── auth.ts               # Authentication utilities
```

**Key Patterns**:
- **Server Components**: Default for data fetching (secure, fast)
- **Client Components**: Used for interactivity (forms, real-time updates)
- **Server Actions**: For mutations (create, update, delete)

---

## Environment-Specific Configuration

### Development

- **Frontend URL**: http://localhost:3000
- **Backend URL**: http://localhost:8000
- **Database**: Neon development branch
- **Logging**: Verbose (for debugging)
- **Auto-reload**: Enabled (for both frontend and backend)

### Staging (Optional)

- **Frontend URL**: https://staging.todo-app.com
- **Backend URL**: https://staging-api.todo-app.com
- **Database**: Neon staging branch
- **Logging**: Moderate
- **Auto-reload**: Disabled

### Production

- **Frontend URL**: https://todo-app.com
- **Backend URL**: https://api.todo-app.com
- **Database**: Neon production branch
- **Logging**: Errors only
- **Auto-reload**: Disabled
- **HTTPS**: Required (TLS/SSL)

---

## Deployment

### Backend Deployment (Vercel/Railway/Render)

**Vercel Example**:
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy backend
cd backend
vercel
```

**Environment Variables** (set in Vercel dashboard):
- `DATABASE_URL`: Neon production connection string
- `JWT_SECRET`: Generate new secret (different from dev)
- `JWT_ALGORITHM`: HS256
- `ACCESS_TOKEN_EXPIRE_MINUTES`: 10080 (7 days)
- `ENVIRONMENT`: production

### Frontend Deployment (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
cd frontend
vercel
```

**Environment Variables** (set in Vercel dashboard):
- `NEXT_PUBLIC_API_URL`: Production backend URL (e.g., https://api.todo-app.com)

---

## Additional Resources

### Documentation

- **Backend**: http://localhost:8000/docs (FastAPI Swagger UI)
- **Specs**: `@specs/001-task-crud/` directory
- **API Contracts**: `@specs/001-task-crud/contracts/openapi.yaml`

### External Libraries

- **FastAPI**: https://fastapi.tiangolo.com/
- **SQLModel**: https://sqlmodel.tiangolo.com/
- **Next.js**: https://nextjs.org/docs
- **Better Auth**: https://www.better-auth.com/docs
- **Neon**: https://neon.tech/docs

### Project Constitution

For project guidelines, see `.specify/memory/constitution.md`.

---

## Troubleshooting

### Issue: "Module not found" errors

**Solution**: Ensure you're in the correct directory (`frontend/` or `backend/`).

### Issue: "Port already in use"

**Backend** (port 8000):
```bash
# Kill process on port 8000 (macOS/Linux)
lsof -ti:8000 | xargs kill -9

# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

**Frontend** (port 3000):
```bash
# Kill process on port 3000 (macOS/Linux)
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Issue: "Database migration failed"

**Solution**:
```bash
# Check current migration state
alembic current

# Reset database (WARNING: deletes data)
alembic downgrade base
alembic upgrade head
```

---

## Getting Help

- **Spec Issues**: Review `@specs/001-task-crud/spec.md`
- **API Issues**: Test endpoints in http://localhost:8000/docs
- **Database Issues**: Check Neon dashboard
- **Configuration Issues**: Verify `.env` files exist and are correctly formatted

---

**Quickstart Status**: Complete ✅
**Next Steps**: Run `/sp.tasks` to generate implementation tasks, then begin development with agents.
