import { loadRateLimitConfig } from '../../src/rate-limit/rate-limit.config';

describe('rate limit configuration', () => {
  it('uses memory only for tests and local development', () => {
    expect(loadRateLimitConfig({ NODE_ENV: 'test' })).toEqual({
      mode: 'memory',
      namespace: 'petrodesk:test',
      timeoutMs: 750,
    });
  });

  it('falls back to memory in production when Upstash variables are missing', () => {
    expect(loadRateLimitConfig({ NODE_ENV: 'production' })).toEqual({
      mode: 'memory',
      namespace: 'petrodesk:production',
      timeoutMs: 750,
    });
  });

  it('accepts an explicit secure Upstash configuration', () => {
    expect(
      loadRateLimitConfig({
        NODE_ENV: 'production',
        UPSTASH_REDIS_REST_URL: 'https://example.upstash.io',
        UPSTASH_REDIS_REST_TOKEN: 'test-token',
        LOGIN_RATE_LIMIT_NAMESPACE: 'petrodesk:production',
        LOGIN_RATE_LIMIT_TIMEOUT_MS: '900',
      }),
    ).toEqual({
      mode: 'upstash',
      namespace: 'petrodesk:production',
      timeoutMs: 900,
      redisUrl: 'https://example.upstash.io',
      redisToken: 'test-token',
    });
  });

  it('rejects insecure URLs, namespaces, and timeout values', () => {
    const base = {
      NODE_ENV: 'production',
      UPSTASH_REDIS_REST_TOKEN: 'test-token',
      LOGIN_RATE_LIMIT_NAMESPACE: 'petrodesk:production',
    };
    expect(() => loadRateLimitConfig({ ...base, UPSTASH_REDIS_REST_URL: 'http://example.test' })).toThrow(
      'UPSTASH_REDIS_REST_URL must use https',
    );
    expect(() =>
      loadRateLimitConfig({ ...base, UPSTASH_REDIS_REST_URL: 'https://example.test', LOGIN_RATE_LIMIT_NAMESPACE: '../prod' }),
    ).toThrow('LOGIN_RATE_LIMIT_NAMESPACE is invalid');
    expect(() =>
      loadRateLimitConfig({ ...base, UPSTASH_REDIS_REST_URL: 'https://example.test', LOGIN_RATE_LIMIT_TIMEOUT_MS: '50' }),
    ).toThrow('LOGIN_RATE_LIMIT_TIMEOUT_MS must be between 100 and 5000');
  });
});
