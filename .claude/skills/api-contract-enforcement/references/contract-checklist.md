# API Contract Enforcement Checklist

Use this checklist to verify that REST endpoint implementations strictly match API specifications.

## 1. Endpoint Definition
- [ ] **HTTP Method**: Method matches spec exactly (GET, POST, PUT, PATCH, DELETE).
- [ ] **Path Structure**: Path matches spec including all path parameters (e.g., `/api/users/{id}`).
- [ ] **Path Parameters**: All path parameters in spec are present in implementation.
- [ ] **Query Parameters**: Required query parameters are enforced; optional ones are documented.

## 2. Request Payload
- [ ] **Content-Type**: Expected content types are specified (e.g., `application/json`).
- [ ] **Request Schema**: Request body structure matches spec schema exactly.
- [ ] **Required Fields**: All required fields from spec are validated in implementation.
- [ ] **Optional Fields**: Optional fields are handled correctly (not required, but accepted).
- [ ] **Field Types**: Data types match spec (string, integer, boolean, array, object).
- [ ] **Validation Rules**: Constraints from spec are enforced (min/max length, patterns, enums).

## 3. Response Payload
- [ ] **Success Status Codes**: Correct HTTP status returned for success cases (200, 201, 204).
- [ ] **Response Schema**: Response body structure matches spec exactly.
- [ ] **Response Fields**: All documented fields are present in response.
- [ ] **Field Types**: Response data types match spec.

## 4. Error Handling
- [ ] **Error Status Codes**: All error cases from spec return correct status codes (400, 401, 403, 404, 500).
- [ ] **Error Response Format**: Error responses follow standardized format from spec.
- [ ] **Error Messages**: Error messages match documented examples or patterns.
- [ ] **Validation Errors**: Field-level validation errors provide clear, spec-compliant feedback.

## 5. Security & Authorization
- [ ] **Authentication**: Endpoints requiring auth enforce authentication as specified.
- [ ] **Authorization**: Permission checks match spec requirements.
- [ ] **Security Headers**: Required security headers are present (e.g., CORS, Content-Security-Policy).

## 6. Additional Constraints
- [ ] **Rate Limiting**: Rate limits from spec are implemented if specified.
- [ ] **Pagination**: Pagination parameters and response format match spec.
- [ ] **Sorting/Filtering**: Query parameters for sorting and filtering match spec.
- [ ] **Versioning**: API version in path or header matches spec.
