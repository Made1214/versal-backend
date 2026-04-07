---
description: "Use when creating or updating Vitest tests, mocks, fixtures, or test setup for backend features."
name: "Testing Rules"
applyTo:
  - "src/__tests__/**/*.js"
  - "vitest.config.js"
---

# Testing Rules

- Prefer focused tests close to the changed feature first.
- Reuse helpers in src/**tests**/helpers/ before creating new fixtures.
- Keep test names explicit with expected behavior and condition.
- Mock external systems (Cloudinary, payments, etc.) instead of calling real services.

## Test Execution

- Run only relevant tests first.
- Use pnpm test for full validation when feature-level tests pass.
