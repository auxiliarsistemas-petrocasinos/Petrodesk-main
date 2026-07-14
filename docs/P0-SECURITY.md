# Petrodesk P0 security policy

## Authorization

| Resource | ADMIN | IT_SUPPORT | END_USER |
| --- | --- | --- | --- |
| Users | Administrative CRUD | Options only | No directory or administration |
| Loans read/create | All | All | Own beneficiary/requester records only |
| Loan workflow | All transitions | None | None |
| Notifications | Own only | Own only | Own only |

Authorization is enforced in NestJS services/policies. Client capabilities are
only a UX aid. Foreign resources return 404 where existence would enable
enumeration.

## Deployment prerequisites

- Provision and rotate `JWT_SECRET` before deploying PR3 or later. Existing
  tokens are intentionally invalidated by rotation.
- Set exact `CORS_ORIGINS` in preview and production. Production fails closed
  when it is missing.
- The login limiter is per application instance. A shared limiter store is a
  P1 requirement before horizontal scaling.
- Audit and rotate accounts created by the historical seed. The development
  seed is disabled in production and now requires an explicit temporary value.

## CI policy

The initial global coverage floor reflects a codebase that started without
tests. It may only increase toward 80%; reductions are prohibited. New and
modified P0 security code requires focused unit or API tests.

`npm audit --audit-level=critical` blocks critical vulnerabilities. Existing
high findings requiring breaking NestJS/bcrypt upgrades are tracked for P1 and
must not be silently waived or automatically force-upgraded.

The test schema is produced with `prisma db push` only against disposable
databases named `petrodesk_test*`. This is not a production migration baseline.
