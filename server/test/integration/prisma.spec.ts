import { PrismaClient } from '@prisma/client';
import { assertSafeTestDatabaseEnvironment } from '../database-guard';

describe('Prisma test database smoke', () => {
  const prisma = new PrismaClient();
  const fieldId = '00000000-0000-4000-8000-000000000001';

  beforeAll(async () => {
    assertSafeTestDatabaseEnvironment();
    await prisma.$connect();
    await prisma.field.deleteMany({ where: { id: fieldId } });
  });

  afterAll(async () => {
    await prisma.field.deleteMany({ where: { id: fieldId } });
    await prisma.$disconnect();
  });

  it('writes and reads a deterministic test fixture', async () => {
    await prisma.field.create({
      data: { id: fieldId, name: `test-${fieldId}`, location: 'test-only' },
    });
    await expect(prisma.field.findUnique({ where: { id: fieldId } })).resolves.toMatchObject({ id: fieldId });
  });
});
