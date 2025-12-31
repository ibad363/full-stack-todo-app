---
name: spec-validation
description: Validates Phase II specifications for completeness, internal consistency, and clear acceptance criteria. Use this skill BEFORE moving from specification to planning or implementation. It ensures that requirements are testable, technology-agnostic, and fulfill user needs.
---

# Spec Validation

Validate Phase II specifications to ensure they meet the quality bar for architectural planning and implementation.

## Workflow

1.  **Read Target Spec**: Read the target specification file (typically `specs/<feature>/spec.md`).
2.  **Verify Structure**: Ensure all mandatory sections from the spec template are present.
3.  **Perform Deep Audit**: Use [validation-checklist.md](references/validation-checklist.md) to evaluate content quality.
4.  **Check for Implementation Leakage**: Flag any mentions of specific frameworks, databases, or libraries in the specification.
5.  **Validate Success Criteria**: Ensure criteria are measurable and verifiable.
6.  **Generate Report**: Produce a report following the [report-pattern.md](references/report-pattern.md).

## Quality Standards

- **Independence**: Can a developer build *only* P1 stories and have a working MVP?
- **Testability**: Is "Given/When/Then" used correctly to define behavior?
- **Clarity**: Are there any remaining `[NEEDS CLARIFICATION]` markers?
- **Separation of Concerns**: Does the spec describe *What* (business) without leaking *How* (technical)?

## Usage Examples

### Validate a specific feature
"Validate the spec for 1-user-auth"

### Audit current branch spec
"Run spec-validation on my current spec"

## Reference Files

| Resource | Description |
|----------|-------------|
| [Validation Checklist](references/validation-checklist.md) | Detailed audit items for spec quality |
| [Report Pattern](references/report-pattern.md) | Standardized output format for validation results |
