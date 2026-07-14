import { assertSafeTestDatabaseUrl } from '../database-guard';

describe('test database guard', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test';
  });

  it('accepts an explicitly local petrodesk_test database', () => {
    expect(() => assertSafeTestDatabaseUrl('postgresql://user:pass@127.0.0.1:55432/petrodesk_test')).not.toThrow();
  });

  it('rejects remote hosts', () => {
    expect(() => assertSafeTestDatabaseUrl('postgresql://user:pass@db.example.test:5432/petrodesk_test')).toThrow(
      'approved local test host',
    );
  });

  it('rejects databases without the test prefix', () => {
    expect(() => assertSafeTestDatabaseUrl('postgresql://user:pass@127.0.0.1:55432/production')).toThrow(
      'must start with petrodesk_test',
    );
  });

  it('rejects use outside NODE_ENV=test', () => {
    process.env.NODE_ENV = 'development';
    expect(() => assertSafeTestDatabaseUrl('postgresql://user:pass@127.0.0.1:55432/petrodesk_test')).toThrow(
      'NODE_ENV=test',
    );
  });
});
