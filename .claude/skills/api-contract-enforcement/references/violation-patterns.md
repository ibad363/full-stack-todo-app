# Common API Contract Violations

This document catalogs common patterns of contract violations to help identify issues quickly.

## 1. Method Mismatches

**Spec says**: `POST /api/users`
**Implementation has**: `PUT /api/users`
**Violation**: HTTP method doesn't match spec.

## 2. Path Discrepancies

**Spec says**: `/api/v1/users/{userId}/orders`
**Implementation has**: `/api/users/{id}/orders`
**Violations**:
- Missing version prefix (`v1`)
- Parameter name mismatch (`userId` vs `id`)

## 3. Missing Required Fields

**Spec requires**:
```json
{
  "email": "string",
  "password": "string",
  "firstName": "string"
}
```

**Implementation accepts**:
```json
{
  "email": "string",
  "password": "string"
}
```
**Violation**: `firstName` is required in spec but not validated in implementation.

## 4. Type Mismatches

**Spec says**: `"age": integer`
**Implementation returns**: `"age": "25"` (string)
**Violation**: Field type doesn't match spec.

## 5. Wrong Status Codes

**Spec says**: Return `201 Created` on successful user creation
**Implementation returns**: `200 OK`
**Violation**: Success status code doesn't match spec.

## 6. Inconsistent Error Responses

**Spec defines**:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "string",
    "fields": ["fieldName"]
  }
}
```

**Implementation returns**:
```json
{
  "message": "Validation failed"
}
```
**Violation**: Error response structure doesn't match spec.

## 7. Missing Error Cases

**Spec documents**: `404 Not Found` when user doesn't exist
**Implementation**: Returns `500 Internal Server Error` or no explicit handling
**Violation**: Documented error case not implemented.

## 8. Undocumented Fields

**Spec defines**: `{ "id", "name", "email" }`
**Implementation returns**: `{ "id", "name", "email", "internal_flag" }`
**Violation**: Response includes fields not in spec (breaking contract by adding).

## 9. Missing Validation

**Spec says**: `email` must match email format
**Implementation**: Accepts any string
**Violation**: Validation constraint from spec not enforced.

## 10. Authentication/Authorization Gaps

**Spec says**: Endpoint requires `admin` role
**Implementation**: No role check, any authenticated user can access
**Violation**: Authorization requirement not enforced.
