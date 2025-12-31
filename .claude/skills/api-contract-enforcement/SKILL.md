---
name: api-contract-enforcement
description: Validates that REST endpoint implementations strictly match API specifications, including HTTP methods, paths, request/response payloads, status codes, and error formats. Use when implementing new endpoints, updating existing APIs, or auditing API compliance. Ensures contract integrity between spec and code.
---

# API Contract Enforcement

Ensure REST endpoint implementations strictly adhere to API specifications.

## Workflow

### 1. Locate Spec and Implementation
- **Find API Spec**: Identify the API specification (OpenAPI/Swagger file, or plan.md API section).
- **Find Implementation**: Locate the route handler/controller in the codebase (FastAPI routes, Express routes, etc.).

### 2. Extract Contract Details
From the spec, extract:
- HTTP method and path
- Path parameters and query parameters
- Request body schema (required fields, types, validation rules)
- Response body schema (success and error cases)
- Status codes for all cases
- Authentication/authorization requirements

### 3. Audit Implementation
Use [contract-checklist.md](references/contract-checklist.md) to verify:
- Endpoint definition matches
- Request validation is complete
- Response structure is correct
- Error handling follows spec
- Security requirements are enforced

### 4. Identify Violations
Compare spec vs. implementation:
- **Critical**: Mismatched methods, paths, required fields, status codes
- **Warnings**: Missing optional validations, inconsistent naming
- Refer to [violation-patterns.md](references/violation-patterns.md) for common issues

### 5. Generate Report
Produce a report using [enforcement-report.md](references/enforcement-report.md):
- List all violations with code references
- Provide actionable fixes
- Assign compliance score

## Key Principles

- **Exact Match Required**: Methods, paths, and required fields must match spec exactly.
- **Type Safety**: Data types must match spec (string vs. integer matters).
- **Error Consistency**: All documented error cases must be implemented with correct status codes.
- **No Extras**: Don't add undocumented fields to responses (breaks contract).

## Usage Examples

### Validate a specific endpoint
"Check if POST /api/users endpoint matches the spec"

### Audit all endpoints in a file
"Run API contract enforcement on backend/routes/users.py"

### Compare spec to implementation
"Validate that the todo endpoints in main.py match specs/1-todo-api/plan.md"

## Reference Files

| File | Purpose |
|------|---------|
| [contract-checklist.md](references/contract-checklist.md) | Comprehensive audit checklist for API compliance |
| [violation-patterns.md](references/violation-patterns.md) | Common contract violations with examples |
| [enforcement-report.md](references/enforcement-report.md) | Standardized report template |

## Common Pitfalls

- **Status Code Confusion**: Using 200 for everything instead of 201 (Created), 204 (No Content), etc.
- **Type Coercion**: Accepting string "123" when spec requires integer 123.
- **Missing Validation**: Not enforcing required fields or constraints (min/max length, regex patterns).
- **Generic Errors**: Returning 500 for client errors that should be 400, 404, etc.
