import { getClientTracker } from '../../src/rate-limit/client-tracker';

describe('rate limit client tracker', () => {
  it('uses the local Express address and normalizes IPv4-mapped IPv6', () => {
    expect(getClientTracker({ ip: '::ffff:192.0.2.10', headers: {} }, {})).toBe('192.0.2.10');
  });

  it('trusts the Vercel-controlled forwarded header only on Vercel', () => {
    const request = {
      ip: '127.0.0.1',
      headers: {
        'x-vercel-forwarded-for': '2001:db8::1',
        'x-forwarded-for': '203.0.113.99',
      },
    };
    expect(getClientTracker(request, { VERCEL: '1' })).toBe('2001:db8::1');
    expect(getClientTracker(request, {})).toBe('127.0.0.1');
  });

  it('does not allow malformed addresses to create arbitrary buckets', () => {
    expect(getClientTracker({ ip: 'not-an-ip', headers: {} }, {})).toBe('unknown');
    expect(getClientTracker({ headers: { 'x-vercel-forwarded-for': ['bad', '198.51.100.2'] } }, { VERCEL: '1' })).toBe(
      'unknown',
    );
  });
});
