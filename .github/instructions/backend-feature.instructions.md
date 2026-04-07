---
description: "Use when editing Fastify routes, controllers, services, repositories, plugins, middleware, or Prisma-backed business logic in this backend."
name: "Backend Feature Rules"
applyTo:
  - "app.js"
  - "src/features/**/*.js"
  - "src/repositories/**/*.js"
  - "src/middlewares/**/*.js"
  - "src/plugins/**/*.js"
  - "src/utils/**/*.js"
---

# Backend Feature Rules

- Keep service layer as business logic source of truth.
- Throw ValidationError, NotFoundError, ForbiddenError, etc. from src/utils/errors.js.
- Controllers should stay thin: parse request, call service, send response.
- Do not introduce console.log in app code; use request.log or fastify.log.
- Follow existing module structure per feature.

## Before Finalizing Changes

- Confirm route schemas are aligned with controller inputs.
- Confirm error messages remain consistent with existing patterns.
- Add or update tests for behavior changes.
