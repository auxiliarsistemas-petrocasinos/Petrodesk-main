---
name: review-code
description: Perform a professional PR review for correctness, security, tests, performance, accessibility, architecture, duplication, and maintainability. Use when asked to review, audit a change, or assess pull-request readiness.
---
# Review code
1. Read the diff, surrounding contracts, tests, schema/migrations, and runtime configuration.
2. Do not edit unless explicitly asked; safely verify suspicious behavior.
3. Prioritize bugs/security, then tests, integrity, performance, accessibility, and maintainability.
4. Cite exact file/line, failure scenario, impact, and smallest correction.
5. Avoid style noise, implausible hypotheticals, and diff summaries.
6. State assumptions and verification gaps; if no findings exist, state residual test risk.
