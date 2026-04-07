---
name: security-review
description: "Review backend changes for security risks in auth, authorization, input validation, secrets handling, file uploads, and rate limiting. Use when auditing PRs, debugging suspicious behavior, or before release."
argument-hint: "Scope to review (feature, file, or endpoint)"
user-invocable: true
---

# Security Review Skill

Use this skill to run a focused backend security review without reading unnecessary files.

## When to Use

- Reviewing pull requests before merge.
- Investigating suspicious API behavior.
- Verifying auth and authorization paths.
- Checking upload, payment, and public endpoints.

## Procedure

1. Start with docs/ai/QUICK_START.md and docs/ENDPOINTS.md for security-sensitive flows.
2. Read only affected files plus these hotspots when relevant:
   - src/plugins/auth.plugin.js
   - src/middlewares/isAuthenticated.js
   - src/middlewares/isOwner.js
   - src/middlewares/isAdmin.js
   - src/middlewares/errorHandler.js
   - src/utils/errors.js
3. Evaluate findings in this order:
   - Authentication bypass risk
   - Authorization and ownership checks
   - Input validation and schema gaps
   - Sensitive data exposure in responses/logs
   - Rate-limit and brute-force protection
   - Upload and external integration safety
4. Report findings by severity with exact file references.
5. Add minimal safe fixes only for confirmed risks.

## Output Format

1. Findings (Critical to Low), each with file and impact.
2. Open questions or assumptions.
3. Minimal remediation plan.
