# Spec Validation Checklist

Use this checklist to perform a comprehensive validation of a Phase II feature specification.

## 1. Metadata and Structure
- [ ] **Branch Name**: Branch name exists and follows `[number]-[short-name]` pattern.
- [ ] **Status**: Status is clearly marked (Draft/Review/Approved).
- [ ] **Mandatory Sections**: All mandatory sections (User Scenarios, Requirements, Success Criteria) are present.

## 2. User Scenarios & Testing
- [ ] **Prioritization**: All user stories have clear priority levels (P1, P2, P3).
- [ ] **Independence**: Each user story is independently testable and delivers standalone value.
- [ ] **Acceptance Scenarios**: Every user story contains at least one Given/When/Then scenario.
- [ ] **Edge Cases**: At least 2-3 significant edge cases or error scenarios are identified.

## 3. Functional Requirements
- [ ] **ID Pattern**: Requirements follow the FR-XXX numbering pattern.
- [ ] **Testability**: Every requirement is phrased as a testable capability (MUST/SHOULD).
- [ ] **No Implementation Leakage**: Requirements describe *what* but never *how* (no specific technologies mentioned).
- [ ] **Clarification Resolution**: No `[NEEDS CLARIFICATION]` markers remain in the final spec.

## 4. Success Criteria
- [ ] **Measurability**: Outcomes include specific, verifiable metrics (time, count, percentage).
- [ ] **Technology Agnostic**: Criteria are verified from a user/business perspective, not system internals.
- [ ] **Alignment**: Success criteria directly map back to requirements and user scenarios.

## 5. Entities (if applicable)
- [ ] **Conceptual Clarity**: Entities represent domain concepts, not database tables.
- [ ] **Key Attributes**: Core attributes and relationships are defined without types or schemas.
