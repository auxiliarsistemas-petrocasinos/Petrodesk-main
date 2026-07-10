---
name: supabase-auth
description: Implement or review Supabase authentication for Next.js with SSR cookies, authorization, RLS, secure sessions, redirects, and tests. Use for login, signup, logout, resets, OAuth, MFA, or protected routes.
---
# Implement Supabase authentication
Read the Supabase skill and current Auth/SSR docs first.
1. Separate authentication from authorization and define role/tenant rules.
2. Use supported browser/server clients and validate identity server-side for protected operations.
3. Never authorize with user-editable metadata or expose service-role/secret keys.
4. Validate redirects, limit sensitive endpoints, avoid enumeration, and handle refresh safely.
5. Encode ownership in RLS and account for stale JWT claims.
6. Test expired/revoked sessions, non-owner access, callback failure, reset misuse, and logout.
