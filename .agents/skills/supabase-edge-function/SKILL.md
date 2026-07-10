---
name: supabase-edge-function
description: Create secure Supabase Edge Functions with Deno-compatible dependencies, auth, validation, CORS, secrets, observability, idempotency, and tests. Use for webhooks, integrations, or edge APIs.
---
# Create an Edge Function
1. Verify current Supabase docs and define caller, auth, schema, retries, timeout, and idempotency.
2. Validate inputs; allowlist origins and outbound destinations; use managed secrets.
3. Prefer user-scoped database access and isolate justified service-role operations.
4. Return stable errors without leaking internals; add structured redacted logs and correlation IDs.
5. For webhooks, verify signatures on the required raw body and prevent replay.
6. Test auth failure, malformed requests, retries, timeout, and downstream failure locally.
