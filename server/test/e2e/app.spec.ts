import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { SupabaseService } from '../../src/supabase.service';
import { assertSafeTestDatabaseEnvironment } from '../database-guard';

describe('App smoke (e2e)', () => {
  let httpApp: INestApplication;

  beforeAll(async () => {
    assertSafeTestDatabaseEnvironment();
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(SupabaseService)
      .useValue({ uploadFile: jest.fn() })
      .compile();
    httpApp = moduleRef.createNestApplication();
    await httpApp.init();
  });

  afterAll(async () => {
    await httpApp?.close();
  });

  it('serves the health endpoint without remote services', async () => {
    await request(httpApp.getHttpServer()).get('/health').expect(200).expect(({ body }) => {
      expect(body.status).toBe('ok');
    });
  });
});
