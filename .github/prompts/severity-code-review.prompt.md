---
name: "Severity Code Review"
description: "Run a code review and prioritize findings by severity with concrete file references and missing test coverage."
argument-hint: "Scope (PR, files, feature, or commit range)"
agent: "agent"
---

Perform a code review with findings first and ordered by severity.

Review rules:

- Prioritize real bugs, regressions, security issues, and API contract changes.
- Include test coverage gaps and risky untested paths.
- Keep summary short; findings are primary output.
- If no issues are found, state that explicitly and mention residual risk.

Output format:

1. Findings (Critical, High, Medium, Low)
   - Title
   - Why it matters
   - Exact file reference
   - Suggested fix
2. Open questions or assumptions
3. Residual risks / missing tests
4. Short change summary (optional)
