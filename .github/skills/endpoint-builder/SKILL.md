---
name: endpoint-builder
description: "Create or update backend endpoints using the project pattern: schema, routes, controller, service, repository, and tests. Use when adding CRUD actions or changing API behavior."
argument-hint: "Endpoint goal (method + path + behavior)"
user-invocable: true
---

# Endpoint Builder Skill

Use this skill to deliver endpoint changes safely and consistently.

## When to Use

- Adding a new API endpoint.
- Extending an existing endpoint behavior.
- Refactoring endpoint logic while preserving API contract.

## Procedure

1. Read docs/ENDPOINTS.md only for related routes and response contracts.
2. Identify feature module and follow this order:
   - schema
   - routes
   - controller
   - service
   - repository (if needed)
3. Enforce conventions:
   - Services throw typed errors from src/utils/errors.js
   - Controllers remain thin and avoid business try/catch
   - Use Fastify logger, not console.\*
4. If API behavior changes, update docs/ENDPOINTS.md in the same task.
5. Add focused tests in src/**tests** for the changed behavior.
6. Run relevant tests first, then broader tests only if needed.

## Delivery Checklist

- Endpoint schema matches request and response.
- Authorization middleware is correct.
- Error responses are consistent with existing handlers.
- Docs and tests are updated when behavior changes.
