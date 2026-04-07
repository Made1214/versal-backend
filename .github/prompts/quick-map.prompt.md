---
name: "Quick Project Map"
description: "Generate a compact map of this backend using docs/ai and only the minimum code needed."
argument-hint: "Topic or feature to map (optional)"
agent: "agent"
---

Build a compact project map for Versal Backend.

Requirements:

- Start from docs/ai/QUICK_START.md, docs/ai/Context.md, docs/ai/ESTADO.md.
- Return 8-12 bullets max.
- Include only high-value paths to inspect next.
- If argument is provided, focus on that feature.
- Avoid long code excerpts.

Output format:

1. Current status snapshot (2-3 bullets)
2. Architecture map (3-4 bullets)
3. Suggested next files to open (3-5 bullets)
