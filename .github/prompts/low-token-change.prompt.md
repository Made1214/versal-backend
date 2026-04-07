---
name: "Low Token Change"
description: "Implement a code change with strict context budget and minimal file reads."
argument-hint: "Describe the change request"
agent: "agent"
---

Implement the requested change with a strict context budget.

Rules:

- Read only files directly related to the request.
- Before editing, summarize understanding in up to 6 bullets.
- Keep edits minimal and preserve existing API contracts unless asked.
- If endpoint behavior changes, update docs/ENDPOINTS.md in the same task.
- Run relevant tests first; run full tests only when needed.

Deliverables:

1. What changed and why (short)
2. File list touched
3. Tests executed and result
4. Any risk or follow-up
