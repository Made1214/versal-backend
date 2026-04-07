---
name: prisma-safe-migrations
description: "Plan and apply safe Prisma migrations using expand-contract strategy, risk checks, and verification steps. Use when changing prisma/schema.prisma, adding columns, indexes, constraints, or data migrations."
argument-hint: "Schema change goal"
user-invocable: true
---

# Prisma Safe Migrations

Use this skill to perform schema evolution safely with minimal production risk.

## When to Use

- Editing prisma/schema.prisma.
- Creating migration files in prisma/migrations.
- Changing constraints, enums, indexes, or relation fields.
- Reviewing migration risk before release.

## Safety Strategy

- Prefer expand-contract migrations for breaking changes.
- Avoid one-step destructive changes in active production paths.
- Verify generated SQL before applying.

## Procedure

1. Read only relevant files:
   - prisma/schema.prisma
   - recent prisma/migrations/\*/migration.sql
   - feature service/repository files affected by schema change
2. Classify change risk:
   - Low: add nullable columns, add non-blocking indexes
   - Medium: add required fields with defaults, enum extension
   - High: drop/rename columns, incompatible type changes, unique constraints on dirty data
3. For medium/high risk, use expand-contract:
   - Expand: add new structures while keeping old ones working
   - Migrate data/application usage
   - Contract: remove old fields only after safe rollout
4. Generate migration and inspect SQL carefully.
5. Validate behavior with focused tests for impacted modules.
6. Document endpoint behavior changes in docs/ENDPOINTS.md if applicable.

## Checklist

- No accidental destructive SQL without explicit approval.
- Backfill/update path defined before tightening constraints.
- Indexes/constraints validated against existing data patterns.
- Tests cover read and write paths touched by schema change.
