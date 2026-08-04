import { ServiceUnavailableException } from '@nestjs/common';
import { ThrottlerStorage } from '@nestjs/throttler';

type ThrottlerStorageRecord = Awaited<ReturnType<ThrottlerStorage['increment']>>;

export interface RedisEvalClient {
  eval<T>(script: string, keys: string[], args: number[]): Promise<T>;
}

export interface UpstashThrottlerStorageOptions {
  namespace: string;
  timeoutMs: number;
}

export const FIXED_WINDOW_LUA = `#!lua flags=allow-key-locking
local time = redis.call('TIME')
local now = (tonumber(time[1]) * 1000) + math.floor(tonumber(time[2]) / 1000)
local ttl = tonumber(ARGV[1])
local limit = tonumber(ARGV[2])
local blockDuration = tonumber(ARGV[3])
local values = redis.call('HMGET', KEYS[1], 'hits', 'windowEnd', 'blockEnd')
local hits = tonumber(values[1]) or 0
local windowEnd = tonumber(values[2]) or 0
local blockEnd = tonumber(values[3]) or 0

local blocked = 0
if blockEnd > now then
  blocked = 1
elseif blockEnd > 0 then
  hits = 0
  windowEnd = now + ttl
  blockEnd = 0
elseif windowEnd <= now then
  hits = 0
  windowEnd = now + ttl
  blockEnd = 0
end

if blocked == 0 then
  hits = hits + 1
  if hits > limit then
    blockEnd = now + blockDuration
    blocked = 1
  end
end

redis.call('HSET', KEYS[1], 'hits', hits, 'windowEnd', windowEnd, 'blockEnd', blockEnd)
local expiresAt = math.max(windowEnd, blockEnd)
redis.call('PEXPIRE', KEYS[1], math.max(1, expiresAt - now))
return {
  hits,
  math.max(0, math.ceil((windowEnd - now) / 1000)),
  blocked,
  math.max(0, math.ceil((blockEnd - now) / 1000))
}
`;

function safeThrottlerName(name: string): string {
  return name.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 64) || 'default';
}

function validateResult(value: unknown): [number, number, number, number] {
  if (!Array.isArray(value) || value.length < 4) throw new Error('Invalid rate limit response');
  const result = value.slice(0, 4).map(Number);
  if (result.some((item) => !Number.isFinite(item) || item < 0) || ![0, 1].includes(result[2])) {
    throw new Error('Invalid rate limit response');
  }
  return result as [number, number, number, number];
}

export class UpstashThrottlerStorage implements ThrottlerStorage {
  constructor(
    private readonly redis: RedisEvalClient,
    private readonly options: UpstashThrottlerStorageOptions,
  ) {}

  async increment(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
    throttlerName: string,
  ): Promise<ThrottlerStorageRecord> {
    try {
      const redisKey = `${this.options.namespace}:throttle:${safeThrottlerName(throttlerName)}:${key}`;
      const response = await this.withTimeout(this.redis.eval<unknown>(FIXED_WINDOW_LUA, [redisKey], [ttl, limit, blockDuration]));
      const [totalHits, timeToExpire, blocked, timeToBlockExpire] = validateResult(response);
      return { totalHits, timeToExpire, isBlocked: blocked === 1, timeToBlockExpire };
    } catch {
      throw new ServiceUnavailableException('Rate limit service unavailable');
    }
  }

  private async withTimeout<T>(operation: Promise<T>): Promise<T> {
    let timeout: NodeJS.Timeout | undefined;
    const timeoutPromise = new Promise<never>((_resolve, reject) => {
      timeout = setTimeout(() => reject(new Error('Rate limit timeout')), this.options.timeoutMs);
    });
    try {
      return await Promise.race([operation, timeoutPromise]);
    } finally {
      if (timeout) clearTimeout(timeout);
    }
  }
}
