---
name: supabase-migration
description: Design safe Supabase PostgreSQL migrations with constraints, indexes, grants, RLS, data backfills, locking analysis, advisors, and verification. Use for schema, policy, function, view, trigger, or data changes.
---
# Create a Supabase migration
Read Supabase and PostgreSQL best-practice skills first.
1. Inspect history and use `supabase migration new`; never invent filenames.
2. Explain compatibility, locks, volume, rollback limits, and deployment ordering.
3. Prefer expand/backfill/contract; make backfills bounded, restartable, and observable.
4. Add constraints, grants, RLS, secure views/functions, and indexes deliberately.
5. Never use SECURITY DEFINER merely to bypass permissions; restrict search path and execute grants.
6. Test locally, run advisors, inspect plans, verify migration list, and review SQL.
