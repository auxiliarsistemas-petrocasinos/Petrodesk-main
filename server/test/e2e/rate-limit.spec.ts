import { INestApplication, ServiceUnavailableException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ThrottlerStorage, ThrottlerStorageService } from '@nestjs/throttler';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { configureApplication } from '../../src/app.bootstrap';
import { AuthService } from '../../src/auth/auth.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import { RATE_LIMIT_STORAGE } from '../../src/rate-limit/rate-limit.module';
import { SupabaseService } from '../../src/supabase.service';

async function createRateLimitApp(storage: ThrottlerStorage): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(RATE_LIMIT_STORAGE)
    .useValue(storage)
    .overrideProvider(AuthService)
    .useValue({ validateUser: jest.fn().mockResolvedValue(null), login: jest.fn() })
    .overrideProvider(PrismaService)
    .useValue({
      onModuleInit: jest.fn(),
      $executeRawUnsafe: jest.fn().mockResolvedValue(0),
    })
    .overrideProvider(SupabaseService)
    .useValue({})
    .compile();
  const app = moduleRef.createNestApplication();
  configureApplication(app);
  await app.init();
  return app;
}

describe('shared login rate limiting (e2e)', () => {
  it('enforces one counter across two Nest application instances', async () => {
    const sharedStorage = new ThrottlerStorageService();
    const first = await createRateLimitApp(sharedStorage);
    const second = await createRateLimitApp(sharedStorage);
    try {
      for (let index = 0; index < 5; index += 1) {
        const response = await request((index % 2 === 0 ? first : second).getHttpServer())
          .post('/auth/login')
          .send({ username: 'shared-user', ['password']: 'synthetic-test-value' })
          .expect(401);
        expect(response.headers['x-ratelimit-limit']).toBe('5');
      }
      const blocked = await request(second.getHttpServer())
        .post('/auth/login')
        .send({ username: 'shared-user', ['password']: 'synthetic-test-value' })
        .expect(429);
      expect(blocked.headers['retry-after']).toBe('60');
      expect(blocked.body.message).toBe('Demasiados intentos. Intente nuevamente mas tarde.');
    } finally {
      await Promise.all([first.close(), second.close()]);
    }
  });

  it('fails closed when the shared store is unavailable', async () => {
    const unavailableStorage: ThrottlerStorage = {
      increment: jest.fn().mockRejectedValue(new ServiceUnavailableException('Rate limit service unavailable')),
    };
    const app = await createRateLimitApp(unavailableStorage);
    try {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'user', ['password']: 'synthetic-test-value' })
        .expect(503);
      expect(response.body.message).toBe('Rate limit service unavailable');
    } finally {
      await app.close();
    }
  });
});
