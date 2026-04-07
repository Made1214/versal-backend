# Versal Backend - Agent Guidelines

Use these rules for all tasks in this workspace.

## Primary Sources

- Start with docs/ai/QUICK_START.md for fast context.
- Use docs/ai/ESTADO.md for current status and pending work.
- Use docs/ai/Context.md for architecture decisions.
- Use docs/ENDPOINTS.md for API behavior.

## Token-Efficient Workflow

- Read only the minimum relevant files before proposing changes.
- Prefer concise summaries (6-10 bullets) before deep dives.
- Avoid pasting large file sections when a path + short summary is enough.
- Reuse project docs instead of rebuilding architecture context in every reply.
- For broad tasks, propose a narrow search plan first, then iterate.

## Project Conventions

- Services throw typed errors from src/utils/errors.js.
- Controllers should not wrap business logic in try/catch (global error handler).
- Prefer Fastify logger over console.\* in application code.
- Keep feature structure aligned: controller + service + routes + schema.

## Validation and Testing

- Run only relevant tests first (feature-level), then full suite if needed.
- Test command: pnpm test
- Watch mode: pnpm test:watch

## Safety

- Preserve existing API contracts unless task explicitly requests breaking changes.
- If changing endpoint behavior, update docs/ENDPOINTS.md in the same task.
