import { Module } from '@nestjs/common';
import { ThrottlerStorage, ThrottlerStorageService } from '@nestjs/throttler';
import { Redis } from '@upstash/redis';
import { loadRateLimitConfig } from './rate-limit.config';
import { UpstashThrottlerStorage } from './upstash-throttler.storage';

export const RATE_LIMIT_STORAGE = Symbol('RATE_LIMIT_STORAGE');

function createRateLimitStorage(): ThrottlerStorage {
  const config = loadRateLimitConfig();
  if (config.mode === 'memory') return new ThrottlerStorageService();
  const redis = new Redis({
    url: config.redisUrl,
    token: config.redisToken,
    retry: false,
    signal: () => AbortSignal.timeout(config.timeoutMs),
  });
  return new UpstashThrottlerStorage(redis, config);
}

@Module({
  providers: [{ provide: RATE_LIMIT_STORAGE, useFactory: createRateLimitStorage }],
  exports: [RATE_LIMIT_STORAGE],
})
export class RateLimitModule {}
