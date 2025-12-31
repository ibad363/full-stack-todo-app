# API Contract Enforcement Report Template

Use this template for consistent contract validation reporting.

---

# API Contract Enforcement Report: [Endpoint]

**Endpoint**: `[METHOD] [PATH]`
**Spec Location**: `[path/to/spec.md or OpenAPI file]`
**Implementation**: `[path/to/implementation/file:line]`
**Overall Status**: [✅ COMPLIANT / ⚠️ PARTIAL / ❌ NON-COMPLIANT]

## Summary
[1-2 sentence overview of compliance status]

## Violations Found

### Critical Violations (Blocking)
[Issues that break the contract and must be fixed immediately]

1. **[Violation Type]** - `[Spec Section]`
   - **Expected**: [What the spec requires]
   - **Actual**: [What the implementation does]
   - **Impact**: [Why this matters]
   - **Fix**: [Actionable remedy]

### Warnings (Non-Blocking)
[Issues that should be addressed but don't break core functionality]

1. **[Warning Type]** - `[Spec Section]`
   - **Issue**: [Description]
   - **Recommendation**: [Suggested fix]

## Compliance Score

| Category | Score | Status |
|----------|-------|--------|
| Endpoint Definition | X/5 | [✅/⚠️/❌] |
| Request Payload | X/5 | [✅/⚠️/❌] |
| Response Payload | X/5 | [✅/⚠️/❌] |
| Error Handling | X/5 | [✅/⚠️/❌] |
| Security | X/5 | [✅/⚠️/❌] |

**Overall**: X/25

## Checklist Results
- [x] HTTP Method matches spec
- [ ] Path structure matches spec
- [x] Request schema validated
- [ ] Response schema matches spec
- [ ] Error responses follow spec format

## Required Actions
1. **[High Priority]**: [Action item with code reference]
2. **[Medium Priority]**: [Action item with code reference]

## What's Compliant
- [List aspects that correctly match the spec]

---
