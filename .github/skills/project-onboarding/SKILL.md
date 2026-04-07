---
name: project-onboarding
description: "Quickly understand Versal backend architecture, status, and conventions with minimal token usage. Use when starting a new task, reviewing unknown modules, or preparing safe edits."
argument-hint: "Feature or area to onboard (optional)"
user-invocable: true
---

# Project Onboarding Skill

Use this skill to build a fast, low-token understanding of the codebase before coding.

## When to Use

- Starting work in an unfamiliar feature.
- Estimating impact before code edits.
- Reviewing architecture and current implementation status.

## Procedure

1. Read these docs first:
   - docs/ai/QUICK_START.md
   - docs/ai/ESTADO.md
   - docs/ai/Context.md
2. If API behavior matters, read docs/ENDPOINTS.md only for the relevant routes.
3. Inspect only feature-specific files needed for the task.
4. Produce a compact map (8-12 bullets) with:
   - Current status
   - Architecture touchpoints
   - Exact files likely to change
5. Confirm constraints before coding:
   - Services throw typed errors from src/utils/errors.js
   - Controllers avoid try/catch business wrappers
   - Fastify logger instead of console.\*

## Output Style

- Keep summaries short and actionable.
- Prefer path references over long code pastes.
- Propose smallest safe change first.
