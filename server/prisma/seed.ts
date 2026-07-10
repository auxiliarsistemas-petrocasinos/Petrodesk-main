import { PrismaClient, Role, AssetStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { requireDevelopmentSeedPassword } from './seed-config';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash(requireDevelopmentSeedPassword(), 10);

  // 1. Create Users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@petrodesk.com' },
    update: { username: 'admin', firstName: 'Administrador', lastName: 'Sistema' },
    create: {
      email: 'admin@petrodesk.com',
      username: 'admin',
      password,
      role: Role.ADMIN,
      firstName: 'Administrador',
      lastName: 'Sistema',
      mustChangePassword: true,
    },
  });

  const support1 = await prisma.user.upsert({
    where: { email: 'soporte1@petrodesk.com' },
    update: { username: 'soporte1', firstName: 'Juan', lastName: 'Perez' },
    create: {
      email: 'soporte1@petrodesk.com',
      username: 'soporte1',
      password,
      role: Role.IT_SUPPORT,
      firstName: 'Juan',
      lastName: 'Perez',
      mustChangePassword: true,
    },
  });

  const support2 = await prisma.user.upsert({
    where: { email: 'soporte2@petrodesk.com' },
    update: { username: 'soporte2', firstName: 'Maria', lastName: 'Rodriguez' },
    create: {
      email: 'soporte2@petrodesk.com',
      username: 'soporte2',
      password,
      role: Role.IT_SUPPORT,
      firstName: 'Maria',
      lastName: 'Rodriguez',
      mustChangePassword: true,
    },
  });

  // 2. Create Fields
  const fieldNorte = await prisma.field.upsert({
    where: { id: 'field-norte-id' },
    update: {},
    create: {
      id: 'field-norte-id',
      name: 'Campo Norte',
      location: 'Zona Industrial A',
      supervisorName: 'Ing. Pedro Gomez',
      coordinatorName: 'Laura Velez',
    },
  });

  const fieldSur = await prisma.field.upsert({
    where: { id: 'field-sur-id' },
    update: {},
    create: {
      id: 'field-sur-id',
      name: 'Campo Sur',
      location: 'Sede Operativa B',
      supervisorName: 'Ing. Mario Ruiz',
      coordinatorName: 'Sofia Castro',
    },
  });


  // 3. Create Assets (Cleaned up from user1 references)
  const assetsToCreate = [
    { internalCode: 'PPCEF111', serial: 'SN-12345', brand: 'Dell', model: 'Latitude 5420', status: AssetStatus.AVAILABLE, fieldId: fieldNorte.id },
    { internalCode: 'PPCEF112', serial: 'SN-67890', brand: 'HP', model: 'EliteBook 840', status: AssetStatus.AVAILABLE, fieldId: fieldNorte.id },
    { internalCode: 'PPCEF113', serial: 'SN-11223', brand: 'Lenovo', model: 'ThinkPad X1', status: AssetStatus.MAINTENANCE, fieldId: fieldSur.id },
    { internalCode: 'PPCEF114', serial: 'SN-44556', brand: 'Dell', model: 'OptiPlex 7090', status: AssetStatus.AVAILABLE, fieldId: fieldSur.id },
    { internalCode: 'PPCEF115', serial: 'SN-77889', brand: 'Apple', model: 'MacBook Pro', status: AssetStatus.IN_USE, fieldId: fieldNorte.id, assignedUserId: support1.id },
  ];

  for (const asset of assetsToCreate) {
    await prisma.asset.upsert({
      where: { internalCode: asset.internalCode },
      update: { ...asset },
      create: { ...asset },
    });
  }

  console.log('Semillas (Seed Data) limpias generadas exitosamente.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
