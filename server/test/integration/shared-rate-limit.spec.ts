import { RedisEvalClient, UpstashThrottlerStorage } from '../../src/rate-limit/upstash-throttler.storage';

class AtomicFakeRedis implements RedisEvalClient {
  private readonly entries = new Map<string, { hits: number; windowEnd: number; blockEnd: number }>();

  constructor(private now = 0) {}

  advance(milliseconds: number): void {
    this.now += milliseconds;
  }

  async eval<T>(_script: string, keys: string[], args: number[]): Promise<T> {
    const [ttl, limit, blockDuration] = args;
    const key = keys[0];
    let entry = this.entries.get(key);
    if (entry && entry.blockEnd > this.now) return this.response(entry) as T;
    if (!entry || entry.blockEnd > 0 || entry.windowEnd <= this.now) {
      entry = { hits: 0, windowEnd: this.now + ttl, blockEnd: 0 };
    }
    entry.hits += 1;
    if (entry.hits > limit) entry.blockEnd = this.now + blockDuration;
    this.entries.set(key, entry);
    return this.response(entry) as T;
  }

  private response(entry: { hits: number; windowEnd: number; blockEnd: number }): number[] {
    return [
      entry.hits,
      Math.max(0, Math.ceil((entry.windowEnd - this.now) / 1000)),
      entry.blockEnd > this.now ? 1 : 0,
      Math.max(0, Math.ceil((entry.blockEnd - this.now) / 1000)),
    ];
  }
}

describe('shared rate limit storage contract', () => {
  it('shares a five-request limit across two application instances', async () => {
    const redis = new AtomicFakeRedis();
    const first = new UpstashThrottlerStorage(redis, { namespace: 'test', timeoutMs: 750 });
    const second = new UpstashThrottlerStorage(redis, { namespace: 'test', timeoutMs: 750 });
    const results = [];
    for (let index = 0; index < 6; index += 1) {
      results.push(await (index % 2 === 0 ? first : second).increment('same-client', 60_000, 5, 60_000, 'default'));
    }
    expect(results.slice(0, 5).every((item) => !item.isBlocked)).toBe(true);
    expect(results[5]).toMatchObject({ totalHits: 6, isBlocked: true, timeToBlockExpire: 60 });
  });

  it('enforces the limit under concurrent consumption and resets after the window', async () => {
    const redis = new AtomicFakeRedis();
    const storage = new UpstashThrottlerStorage(redis, { namespace: 'test', timeoutMs: 750 });
    const results = await Promise.all(
      Array.from({ length: 20 }, () => storage.increment('concurrent-client', 60_000, 5, 60_000, 'default')),
    );
    expect(results.filter((item) => !item.isBlocked)).toHaveLength(5);
    expect(results.filter((item) => item.isBlocked)).toHaveLength(15);
    redis.advance(60_000);
    await expect(storage.increment('concurrent-client', 60_000, 5, 60_000, 'default')).resolves.toMatchObject({
      totalHits: 1,
      isBlocked: false,
    });
  });

  it('keeps a late-window block active after the original window expires', async () => {
    const redis = new AtomicFakeRedis();
    const storage = new UpstashThrottlerStorage(redis, { namespace: 'test', timeoutMs: 750 });
    for (let index = 0; index < 5; index += 1) {
      await storage.increment('late-client', 60_000, 5, 60_000, 'default');
    }
    redis.advance(59_000);
    await expect(storage.increment('late-client', 60_000, 5, 60_000, 'default')).resolves.toMatchObject({
      isBlocked: true,
      timeToBlockExpire: 60,
    });
    redis.advance(2_000);
    await expect(storage.increment('late-client', 60_000, 5, 60_000, 'default')).resolves.toMatchObject({
      isBlocked: true,
      timeToBlockExpire: 58,
    });
  });
});
