---
name: fix-error
description: Diagnose and fix reproducible application, build, type, test, deployment, Supabase, or database errors using root-cause evidence, minimal changes, and regression tests. Use for bugs, failures, or incorrect behavior.
---
# Fix an error
1. Reproduce and capture command, environment, stack, input, and expected behavior.
2. Trace the earliest causal error and distinguish symptoms from cause.
3. Explain hypotheses, risks, alternatives, and the smallest safe repair.
4. Fix the failed invariant or boundary without unrelated cleanup.
5. Add a regression test reproducing the original failure.
6. Run targeted checks, then proportional lint, typecheck, tests, and build.
7. Document root cause, fix, verification, and unresolved risk.
