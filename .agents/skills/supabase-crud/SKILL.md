---
name: supabase-crud
description: Implement secure typed CRUD with Supabase, PostgreSQL, Next.js, RLS policies, validation, migrations, and tests. Use when creating, reading, updating, deleting, listing, or searching records.
---
# Implement Supabase CRUD
Read the Supabase skill and current docs first.
1. Model ownership, roles, tenants, validation, constraints, and query shapes.
2. Design indexes, grants, and least-privilege RLS per operation; `TO authenticated` is not authorization.
3. Keep service-role credentials server-only; use generated types, explicit columns, and bounded pagination.
4. Validate mutations, authorize ownership, handle conflicts, and revalidate caches safely.
5. Test anon, owner, non-owner, privileged role, and malformed input; run advisors and plans.
6. Commit a reviewed migration and document access rules and deployment strategy.
