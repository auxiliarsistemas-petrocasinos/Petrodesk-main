import { isIP } from 'node:net';

type HeaderValue = string | string[] | undefined;

export interface RateLimitRequest {
  ip?: string;
  headers: Record<string, HeaderValue>;
  socket?: { remoteAddress?: string };
}

function firstHeaderValue(value: HeaderValue): string | undefined {
  const first = Array.isArray(value) ? value[0] : value;
  return first?.split(',')[0]?.trim();
}

function normalizeIp(value: string | undefined): string {
  if (!value) return 'unknown';
  const withoutZone = value.trim().split('%')[0];
  const candidate = withoutZone.toLowerCase().startsWith('::ffff:') ? withoutZone.slice(7) : withoutZone;
  const version = isIP(candidate);
  if (version === 4) return candidate;
  if (version !== 6) return 'unknown';
  try {
    return new URL(`http://[${candidate}]`).hostname.slice(1, -1).toLowerCase();
  } catch {
    return 'unknown';
  }
}

export function getClientTracker(
  request: RateLimitRequest,
  environment: Readonly<Record<string, string | undefined>> = process.env,
): string {
  const address = environment.VERCEL
    ? firstHeaderValue(request.headers['x-vercel-forwarded-for'])
    : request.ip || request.socket?.remoteAddress;
  return normalizeIp(address);
}
