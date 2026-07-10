# Petrodesk backend tests

The test harness must use a PostgreSQL database whose name begins with
`petrodesk_test` and whose host is `localhost`, `127.0.0.1`, or the local
Compose service `postgres-test`. It must set `NODE_ENV=test` before importing
Prisma or the Nest application.

The production seed is never a test fixture. Fixtures must be created by test
builders and teardown may only touch a database that passed the guard in
`database-guard.ts`.

`docker-compose.test.yml` is disposable test infrastructure only. It does not
replace the incomplete production Prisma migration history; creating an
audited production baseline remains a separate P1/P2 task.
