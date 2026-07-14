import { INestApplication } from '@nestjs/common';
import { PrismaClient, Role } from '@prisma/client';
import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { configureApplication } from '../../src/app.bootstrap';
import { SupabaseService } from '../../src/supabase.service';
import { VisitsService } from '../../src/visits/visits.service';
import { assertSafeTestDatabaseEnvironment } from '../database-guard';

describe('P0 API security (e2e)', () => {
  let app: INestApplication;
  const prisma = new PrismaClient();
  const ids = { admin: '10000000-0000-4000-8000-000000000001', support: '10000000-0000-4000-8000-000000000002', end: '10000000-0000-4000-8000-000000000003', pending: '10000000-0000-4000-8000-000000000004', asset: '20000000-0000-4000-8000-000000000001', asset2: '20000000-0000-4000-8000-000000000002', loan: '30000000-0000-4000-8000-000000000001', notification: '40000000-0000-4000-8000-000000000001' };
  const uploadFile = jest.fn().mockResolvedValue('https://example.test/report.pdf');
  const updateReportPath = jest.fn().mockResolvedValue({ id: 'visit-e2e' });
  let adminToken = '';
  let endToken = '';
  let pendingToken = '';

  beforeAll(async () => {
    assertSafeTestDatabaseEnvironment();
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(SupabaseService)
      .useValue({ uploadFile })
      .overrideProvider(VisitsService)
      .useValue({ updateReportPath })
      .compile();
    app = moduleRef.createNestApplication();
    configureApplication(app);
    await app.init();
    await prisma.$connect();
    const password = await bcrypt.hash('LocalTest123!', 4);
    await prisma.user.createMany({ data: [
      { id: ids.admin, email: 'admin-e2e@example.test', username: 'admin-e2e', password, role: Role.ADMIN },
      { id: ids.support, email: 'support-e2e@example.test', username: 'support-e2e', password, role: Role.IT_SUPPORT },
      { id: ids.end, email: 'end-e2e@example.test', username: 'end-e2e', password, role: Role.END_USER },
      { id: ids.pending, email: 'pending-e2e@example.test', username: 'pending-e2e', password, role: Role.END_USER, mustChangePassword: true },
    ] });
    await prisma.asset.createMany({ data: [
      { id: ids.asset, internalCode: 'E2E-ASSET-1', serial: 'E2E-1', brand: 'Test', model: 'Test' },
      { id: ids.asset2, internalCode: 'E2E-ASSET-2', serial: 'E2E-2', brand: 'Test', model: 'Test' },
    ] });
    await prisma.loan.create({ data: { id: ids.loan, assetId: ids.asset, userId: ids.support, requestedById: ids.support, expectedReturnDate: new Date(Date.now() + 86_400_000) } });
    await prisma.notification.create({ data: { id: ids.notification, userId: ids.support, type: 'E2E', message: 'test' } });
    adminToken = (await request(app.getHttpServer()).post('/auth/login').send({ username: 'admin-e2e', password: 'LocalTest123!' })).body.access_token;
    endToken = (await request(app.getHttpServer()).post('/auth/login').send({ username: 'end-e2e', password: 'LocalTest123!' })).body.access_token;
    pendingToken = (await request(app.getHttpServer()).post('/auth/login').send({ username: 'pending-e2e', password: 'LocalTest123!' })).body.access_token;
  });

  afterAll(async () => {
    await prisma.notification.deleteMany({ where: { userId: { in: [ids.admin, ids.support, ids.end] } } });
    await prisma.loanHistory.deleteMany({ where: { loan: { OR: [{ userId: { in: [ids.admin, ids.support, ids.end] } }, { requestedById: { in: [ids.admin, ids.support, ids.end] } }] } } });
    await prisma.loan.deleteMany({ where: { OR: [{ userId: { in: [ids.admin, ids.support, ids.end] } }, { requestedById: { in: [ids.admin, ids.support, ids.end] } }] } });
    await prisma.assetHistory.deleteMany({ where: { assetId: { in: [ids.asset, ids.asset2] } } });
    await prisma.asset.deleteMany({ where: { id: { in: [ids.asset, ids.asset2] } } });
    await prisma.user.deleteMany({ where: { id: { in: [ids.admin, ids.support, ids.end, ids.pending] } } });
    await prisma.$disconnect();
    await app.close();
  });

  it('uses production validation and rejects invalid JWTs', async () => {
    await request(app.getHttpServer()).post('/auth/login').send({ username: 'user', password: 'long-enough', unexpected: true }).expect(400);
    await request(app.getHttpServer()).get('/users').set('Authorization', 'Bearer invalid-token').expect(401);
  });

  it('enforces user RBAC and safe projections', async () => {
    await request(app.getHttpServer()).get('/users').set('Authorization', `Bearer ${endToken}`).expect(403);
    const response = await request(app.getHttpServer()).get('/users').set('Authorization', `Bearer ${adminToken}`).expect(200);
    expect(response.body.every((user: Record<string, unknown>) => !('password' in user))).toBe(true);
  });

  it('restricts pending-password tokens to the recovery surface', async () => {
    await request(app.getHttpServer()).get('/auth/me').set('Authorization', `Bearer ${pendingToken}`).expect(200);
    await request(app.getHttpServer()).get('/loans').set('Authorization', `Bearer ${pendingToken}`).expect(403);
  });

  it('enforces loan and notification ownership', async () => {
    await request(app.getHttpServer()).get(`/loans/${ids.loan}`).set('Authorization', `Bearer ${endToken}`).expect(404);
    const created = await request(app.getHttpServer()).post('/loans').set('Authorization', `Bearer ${endToken}`).send({ assetId: ids.asset2, userId: ids.support, expectedReturnDate: new Date(Date.now() + 172_800_000).toISOString(), notes: 'E2E own loan' }).expect(201);
    expect(created.body.userId).toBe(ids.end);
    await request(app.getHttpServer()).patch(`/notifications/${ids.notification}/read`).set('Authorization', `Bearer ${endToken}`).expect(404);
  });

  it('rejects missing and non-PDF visit report uploads', async () => {
    await request(app.getHttpServer())
      .post('/visits/non-existent/report')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(400);

    await request(app.getHttpServer())
      .post('/visits/non-existent/report')
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('file', Buffer.from('not a PDF'), {
        filename: 'report.txt',
        contentType: 'text/plain',
      })
      .expect(400);
  });

  it('passes valid PDF report data through the Express 5 upload boundary', async () => {
    uploadFile.mockClear();
    updateReportPath.mockClear();
    const pdf = Buffer.from('%PDF-1.7 test report');

    await request(app.getHttpServer())
      .post('/visits/visit-e2e/report')
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('file', pdf, {
        filename: 'report.pdf',
        contentType: 'application/pdf',
      })
      .expect(201);

    expect(uploadFile).toHaveBeenCalledWith(
      'reports',
      expect.stringMatching(/^report-visit-e2e-.*\.pdf$/),
      pdf,
      'application/pdf',
    );
    expect(updateReportPath).toHaveBeenCalledWith(
      'visit-e2e',
      'https://example.test/report.pdf',
    );
  });

  it('serializes concurrent loan workflow effects', async () => {
    const [approve, reject] = await Promise.all([
      request(app.getHttpServer()).post(`/loans/${ids.loan}/approve`).set('Authorization', `Bearer ${adminToken}`).send({}),
      request(app.getHttpServer()).post(`/loans/${ids.loan}/reject`).set('Authorization', `Bearer ${adminToken}`).send({ notes: 'Concurrent E2E rejection' }),
    ]);
    expect([201, 400, 409]).toContain(approve.status);
    expect([201, 400, 409]).toContain(reject.status);
    const history = await prisma.loanHistory.findMany({ where: { loanId: ids.loan } });
    expect(history.filter((item) => item.action === 'APPROVED')).toHaveLength(approve.status === 201 ? 1 : 0);
    expect(history.filter((item) => item.action === 'REJECTED')).toHaveLength(reject.status === 201 ? 1 : 0);
  });
});
