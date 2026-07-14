---
name: audit-security
description: Audit TypeScript, Next.js, Supabase, PostgreSQL, Vercel, or GitHub changes for secrets, access control, XSS, injection, CSRF, SSRF, dependencies, and insecure configuration. Use for security reviews or release gates.
---
# Audit security
1. Define assets, actors, trust boundaries, entry points, privileges, and changed attack surface.
2. Scan tracked/staged scope for secrets without printing values; inspect ignore rules, logs, and bundles.
3. Check authz, tenant isolation, RLS/grants, validation, encoding, parameterization, redirects, files, CORS, CSRF, and outbound URLs.
4. Review service-role use, metadata authz, views/functions, Storage, JWT freshness, and Edge secrets.
5. Run available dependency/static checks.
6. Report confirmed exploitable findings first with severity, evidence, impact, remediation, and verification.
