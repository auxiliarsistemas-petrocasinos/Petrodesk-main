import { ServiceUnavailableException } from '@nestjs/common';
import {
  RedisEvalClient,
  UpstashThrottlerStorage,
} from '../../src/rate-limit/upstash-throttler.storage';

describe('UpstashThrottlerStorage', () => {
  it('maps the atomic Redis response to the Nest throttler contract', async () => {
    const evalCall = jest.fn().mockResolvedValue([3, 42, 0, 0]);
    const storage = new UpstashThrottlerStorage({ eval: evalCall } as RedisEvalClient, {
      namespace: 'petrodesk:preview',
      timeoutMs: 750,
    });

    await expect(storage.increment('hashed-key', 60_000, 5, 60_000, 'default')).resolves.toEqual({
      totalHits: 3,
      timeToExpire: 42,
      isBlocked: false,
      timeToBlockExpire: 0,
    });
    expect(evalCall).toHaveBeenCalledWith(
      expect.stringMatching(/^#!lua flags=allow-key-locking\n[\s\S]*redis\.call\('TIME'\)/),
      ['petrodesk:preview:throttle:default:hashed-key'],
      [60_000, 5, 60_000],
    );
  });

  it('fails closed without leaking provider details', async () => {
    const storage = new UpstashThrottlerStorage(
      { eval: jest.fn().mockRejectedValue(new Error('https://token@example.upstash.io')) } as RedisEvalClient,
      { namespace: 'petrodesk:preview', timeoutMs: 750 },
    );

    await expect(storage.increment('key', 60_000, 5, 60_000, 'default')).rejects.toEqual(
      new ServiceUnavailableException('Rate limit service unavailable'),
    );
  });

  it('times out and fails closed', async () => {
    jest.useFakeTimers();
    const storage = new UpstashThrottlerStorage(
      { eval: jest.fn(() => new Promise(() => undefined)) } as RedisEvalClient,
      { namespace: 'petrodesk:preview', timeoutMs: 100 },
    );
    const result = storage.increment('key', 60_000, 5, 60_000, 'default');
    const expectation = expect(result).rejects.toBeInstanceOf(ServiceUnavailableException);
    await jest.advanceTimersByTimeAsync(101);
    await expectation;
    jest.useRealTimers();
  });

  it('rejects corrupt provider responses', async () => {
    const storage = new UpstashThrottlerStorage(
      { eval: jest.fn().mockResolvedValue(['NaN']) } as RedisEvalClient,
      { namespace: 'petrodesk:preview', timeoutMs: 750 },
    );
    await expect(storage.increment('key', 60_000, 5, 60_000, 'default')).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });
});
