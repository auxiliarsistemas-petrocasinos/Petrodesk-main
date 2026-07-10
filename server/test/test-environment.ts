import { assertSafeTestDatabaseEnvironment } from './database-guard';

export function configureIsolatedTestEnvironment(): void {
  process.env.NODE_ENV = 'test';
  const host = process.env.PETRODESK_TEST_PG_HOST || '127.0.0.1';
  const port = process.env.PETRODESK_TEST_PG_PORT || '55432';
  const user = process.env.PETRODESK_TEST_PG_USER || 'petrodesk_test_user';
  const password = process.env.PETRODESK_TEST_PG_PASSWORD || 'petrodesk_test_password';
  const database = process.env.PETRODESK_TEST_PG_DATABASE || 'petrodesk_test';
  const url = `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${database}`;

  process.env.DATABASE_URL = url;
  process.env.DIRECT_URL = url;
  process.env.JWT_SECRET ||= 'local-only-test-secret-change-me-please';
  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_KEY;
  assertSafeTestDatabaseEnvironment();
}

configureIsolatedTestEnvironment();
