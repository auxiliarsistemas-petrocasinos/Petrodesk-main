export type RateLimitConfig =
  | { mode: 'memory'; namespace: string; timeoutMs: number }
  | { mode: 'upstash'; namespace: string; timeoutMs: number; redisUrl: string; redisToken: string };

const DEFAULT_TIMEOUT_MS = 750;
const NAMESPACE_PATTERN = /^[a-z0-9][a-z0-9:_-]{1,63}$/;

function parseTimeout(value: string | undefined): number {
  const timeout = value === undefined ? DEFAULT_TIMEOUT_MS : Number(value);
  if (!Number.isInteger(timeout) || timeout < 100 || timeout > 5_000) {
    throw new Error('LOGIN_RATE_LIMIT_TIMEOUT_MS must be between 100 and 5000');
  }
  return timeout;
}

function requireNamespace(value: string | undefined, fallback?: string): string {
  const namespace = value?.trim() || fallback;
  if (!namespace || !NAMESPACE_PATTERN.test(namespace)) throw new Error('LOGIN_RATE_LIMIT_NAMESPACE is invalid');
  return namespace;
}

function requireSecureUrl(value: string | undefined): string {
  if (!value?.trim()) throw new Error('UPSTASH_REDIS_REST_URL is required');
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error('UPSTASH_REDIS_REST_URL must use https');
  }
  if (parsed.protocol !== 'https:' || parsed.username || parsed.password) {
    throw new Error('UPSTASH_REDIS_REST_URL must use https');
  }
  return parsed.toString().replace(/\/$/, '');
}

export function loadRateLimitConfig(environment: Readonly<Record<string, string | undefined>> = process.env): RateLimitConfig {
  const production = environment.NODE_ENV === 'production' || Boolean(environment.VERCEL);
  let mode = environment.RATE_LIMIT_STORE?.trim() || (production ? 'upstash' : 'memory');

  if (production && mode === 'memory') {
    console.warn('RATE_LIMIT_STORE is memory in production — consider using upstash.');
  }

  if (mode === 'upstash' && (!environment.UPSTASH_REDIS_REST_URL || !environment.UPSTASH_REDIS_REST_TOKEN)) {
    console.warn('Missing UPSTASH Redis variables, falling back to memory rate limiting.');
    mode = 'memory';
  }

  const timeoutMs = parseTimeout(environment.LOGIN_RATE_LIMIT_TIMEOUT_MS);

  if (mode === 'memory') {
    return {
      mode: 'memory',
      namespace: requireNamespace(environment.LOGIN_RATE_LIMIT_NAMESPACE, `petrodesk:${environment.NODE_ENV || 'development'}`),
      timeoutMs,
    };
  }

  const redisUrl = requireSecureUrl(environment.UPSTASH_REDIS_REST_URL);
  const redisToken = environment.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!redisToken) throw new Error('UPSTASH_REDIS_REST_TOKEN is required');
  return {
    mode: 'upstash',
    namespace: requireNamespace(environment.LOGIN_RATE_LIMIT_NAMESPACE, 'petrodesk:production'),
    timeoutMs,
    redisUrl,
    redisToken,
  };
}
