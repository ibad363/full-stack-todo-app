# API Contracts Overview

**Feature Branch**: `001-task-crud`
**Created**: 2026-01-01
**Based on**: `@specs/001-task-crud/spec.md`, `@specs/001-task-crud/data-model.md`

## Overview

This document provides a high-level overview of the Todo API for multi-user task management. The full OpenAPI 3.0 specification is available in `openapi.yaml`.

**Base URL**:
- Development: `http://localhost:8000/api`
- Production: `https://api.todo-app.com/api`

**Authentication**: JWT Bearer Token (obtained from `/auth/login`)

---

## Authentication

All endpoints except `/auth/register` and `/auth/login` require JWT authentication via `Authorization: Bearer <token>` header.

### Register User

**Endpoint**: `POST /auth/register`
**Auth**: Not required

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response** (201):
```json
{
  "id": 1,
  "email": "user@example.com",
  "created_at": "2026-01-01T10:00:00Z"
}
```

**Errors**:
- 400: Bad request (invalid email format)
- 422: Validation error (password too short, invalid email)

---

### Login

**Endpoint**: `POST /auth/login`
**Auth**: Not required

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response** (200):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 604800
}
```

**Errors**:
- 401: Unauthorized (invalid credentials)
- 422: Validation error

---

### Logout

**Endpoint**: `POST /auth/logout`
**Auth**: Required (JWT)

**Response** (200):
```json
{
  "message": "Logout successful"
}
```

**Note**: Backend is stateless; logout is client-side cleanup (remove token).

---

## Tasks

All task endpoints require JWT authentication.

### List Tasks

**Endpoint**: `GET /tasks`
**Auth**: Required (JWT)

**Query Parameters**:
- `completed` (optional, boolean): Filter by completion status

**Response** (200):
```json
[
  {
    "id": 1,
    "user_id": 1,
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "completed": false,
    "created_at": "2026-01-01T10:00:00Z",
    "updated_at": "2026-01-01T10:00:00Z",
    "completed_at": null
  }
]
```

**Behavior**:
- Returns all tasks for authenticated user only
- Sorted: Incomplete tasks first, then by `created_at` ascending
- If `completed` query param provided, filters by that status

**Errors**:
- 401: Unauthorized

---

### Create Task

**Endpoint**: `POST /tasks`
**Auth**: Required (JWT)

**Request Body**:
```json
{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread"
}
```

**Response** (201):
```json
{
  "id": 1,
  "user_id": 1,
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": false,
  "created_at": "2026-01-01T10:00:00Z",
  "updated_at": "2026-01-01T10:00:00Z",
  "completed_at": null
}
```

**Validation Rules**:
- `title`: Required, 1-200 characters
- `description`: Optional, max 2000 characters

**Errors**:
- 401: Unauthorized
- 422: Validation error (title empty or too long)

---

### Get Task by ID

**Endpoint**: `GET /tasks/{task_id}`
**Auth**: Required (JWT)

**Response** (200):
```json
{
  "id": 1,
  "user_id": 1,
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": false,
  "created_at": "2026-01-01T10:00:00Z",
  "updated_at": "2026-01-01T10:00:00Z",
  "completed_at": null
}
```

**Errors**:
- 401: Unauthorized
- 403: Forbidden (task belongs to another user)
- 404: Not found (task doesn't exist)

---

### Update Task

**Endpoint**: `PATCH /tasks/{task_id}`
**Auth**: Required (JWT)

**Request Body** (partial, all fields optional):
```json
{
  "title": "Buy groceries and snacks",
  "description": "Milk, eggs, bread, snacks"
}
```

**Response** (200):
```json
{
  "id": 1,
  "user_id": 1,
  "title": "Buy groceries and snacks",
  "description": "Milk, eggs, bread, snacks",
  "completed": false,
  "created_at": "2026-01-01T10:00:00Z",
  "updated_at": "2026-01-01T11:00:00Z",
  "completed_at": null
}
```

**Validation Rules**:
- `title`: Optional, 1-200 characters if provided
- `description`: Optional, max 2000 characters if provided
- `updated_at` is automatically updated to current timestamp

**Errors**:
- 401: Unauthorized
- 403: Forbidden (task belongs to another user)
- 404: Not found
- 422: Validation error

---

### Toggle Task Completion

**Endpoint**: `PATCH /tasks/{task_id}/toggle`
**Auth**: Required (JWT)

**Response** (200) - Marking Complete:
```json
{
  "id": 1,
  "user_id": 1,
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": true,
  "created_at": "2026-01-01T10:00:00Z",
  "updated_at": "2026-01-01T11:00:00Z",
  "completed_at": "2026-01-01T11:00:00Z"
}
```

**Response** (200) - Marking Incomplete:
```json
{
  "id": 1,
  "user_id": 1,
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": false,
  "created_at": "2026-01-01T10:00:00Z",
  "updated_at": "2026-01-01T12:00:00Z",
  "completed_at": null
}
```

**Behavior**:
- Flips `completed` status (false ↔ true)
- Updates `completed_at` to current timestamp when marking complete, sets to null when marking incomplete
- Updates `updated_at` to current timestamp

**Errors**:
- 401: Unauthorized
- 403: Forbidden (task belongs to another user)
- 404: Not found

---

### Delete Task

**Endpoint**: `DELETE /tasks/{task_id}`
**Auth**: Required (JWT)

**Response** (204): No content

**Errors**:
- 401: Unauthorized
- 403: Forbidden (task belongs to another user)
- 404: Not found

---

## Error Responses

All errors follow this structure:

```json
{
  "detail": "Human-readable error message"
}
```

### HTTP Status Codes

| Code | Meaning | Example Use Case |
|-------|----------|-----------------|
| 200 | OK | Successful request |
| 201 | Created | Resource created (register, create task) |
| 204 | No Content | Successful deletion |
| 400 | Bad Request | Invalid email format |
| 401 | Unauthorized | Missing, invalid, or expired token |
| 403 | Forbidden | User doesn't own the resource |
| 404 | Not Found | Task doesn't exist |
| 422 | Unprocessable Entity | Validation error (invalid input data) |

### Common Errors

**401 Unauthorized**:
```json
{
  "detail": "Could not validate credentials"
}
```
Cause: Missing, invalid, or expired JWT token.

**403 Forbidden**:
```json
{
  "detail": "You do not have permission to access this resource"
}
```
Cause: User attempting to access another user's task.

**404 Not Found**:
```json
{
  "detail": "Task not found"
}
```
Cause: Task ID doesn't exist or doesn't belong to user.

**422 Validation Error**:
```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "Invalid email format",
      "type": "value_error.email"
    }
  ]
}
```
Cause: Input validation failed (e.g., invalid email, password too short).

---

## Security

### Authentication

- **JWT Token**: Obtained from `/auth/login` endpoint
- **Token Format**: `Authorization: Bearer <token>` header
- **Token Expiration**: 7 days (604800 seconds) by default
- **Token Payload**: Contains `sub` claim with user ID (format: `"user:123"`)

### Authorization

- **User Isolation**: All task operations are scoped to authenticated user via `user_id` foreign key
- **Ownership Validation**: Backend verifies user owns task before allowing update/delete
- **Cross-User Access Prevention**: Returns 403 Forbidden if user attempts to access another user's task

### Input Validation

- All endpoints use Pydantic models for request/response validation
- Email format validated (RFC 5322)
- Password minimum length: 8 characters
- Task title: 1-200 characters
- Task description: 0-2000 characters

---

## Rate Limiting (Recommended)

To prevent abuse, implement rate limiting:

| Endpoint | Rate Limit | Rationale |
|----------|-------------|------------|
| `/auth/register` | 5 requests per IP per hour | Prevent account spam |
| `/auth/login` | 10 requests per IP per minute | Prevent brute-force attacks |
| `/tasks/*` | 100 requests per user per minute | Prevent abuse |

---

## CORS Configuration

Allowed origins (whitelist):
- Development: `http://localhost:3000`
- Production: `https://todo-app.com` (or your production domain)

Headers allowed:
- `Content-Type`
- `Authorization`

Methods allowed:
- `GET`, `POST`, `PATCH`, `DELETE`

Credentials allowed: `true` (for httpOnly cookies)

---

## Testing Examples

### Using cURL

**Register**:
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

**Login**:
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

**List Tasks** (requires JWT):
```bash
curl -X GET http://localhost:8000/api/tasks \
  -H "Authorization: Bearer <your-jwt-token>"
```

**Create Task**:
```bash
curl -X POST http://localhost:8000/api/tasks \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Buy groceries","description":"Milk, eggs, bread"}'
```

---

## OpenAPI Specification

The full OpenAPI 3.0 specification is available in `openapi.yaml`. You can use it to:

- Generate client SDKs (e.g., `openapi-typescript-codegen`)
- Generate server stubs (e.g., `openapi-generator`)
- Test API with tools like Swagger UI or Postman
- Validate API contracts automatically in CI/CD

---

## Implementation Notes

Based on actual implementation, the following details were discovered:

### JWT Token Implementation
- Algorithm: HS256 (HMAC with SHA-256)
- Secret key stored in `JWT_SECRET` environment variable
- Token expiration: 7 days (604800 seconds) by default
- Token payload includes `sub` claim with user ID

### Database Connection
- PostgreSQL with Neon Serverless
- Connection pooling with `pool_pre_ping=True` and `pool_recycle=3600`
- SQLModel ORM with automatic table creation

### Error Handling
- FastAPI automatic validation with Pydantic models
- Custom HTTP exceptions for authentication/authorization errors
- Database transaction management with proper rollback on errors

### Rate Limiting
- Implemented using slowapi for authentication endpoints
- Register: 5 requests per IP per hour
- Login: 10 requests per IP per minute

### CORS Configuration
- Origins: `http://localhost:3000` (dev), production domain (prod)
- Credentials: allowed (for JWT tokens)
- Headers: `Content-Type`, `Authorization`

---

**Phase 1 Status**: Complete ✅
**Next Phase**: Generate Quickstart Guide (`quickstart.md`)
