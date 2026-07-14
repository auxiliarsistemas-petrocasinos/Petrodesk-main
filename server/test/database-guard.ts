import { URL } from 'node:url';

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', 'postgres-test']);

export function assertSafeTestDatabaseUrl(rawUrl: string, label = 'DATABASE_URL'): URL {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error(`${label} can only be used when NODE_ENV=test`);
  }

  const url = new URL(rawUrl);
  if (!['postgres:', 'postgresql:'].includes(url.protocol)) {
    throw new Error(`${label} must use PostgreSQL`);
  }
  if (!LOCAL_HOSTS.has(url.hostname)) {
    throw new Error(`${label} host is not an approved local test host`);
  }
  if (!url.pathname.slice(1).startsWith('petrodesk_test')) {
    throw new Error(`${label} database must start with petrodesk_test`);
  }
  return url;
}

export function assertSafeTestDatabaseEnvironment(): { databaseUrl: string; directUrl: string } {
  const databaseUrl = process.env.DATABASE_URL;
  const directUrl = process.env.DIRECT_URL;
  if (!databaseUrl || !directUrl) {
    throw new Error('DATABASE_URL and DIRECT_URL are required for isolated tests');
  }
  assertSafeTestDatabaseUrl(databaseUrl, 'DATABASE_URL');
  assertSafeTestDatabaseUrl(directUrl, 'DIRECT_URL');
  return { databaseUrl, directUrl };
}
