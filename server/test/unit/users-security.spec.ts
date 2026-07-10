import { Role } from '@prisma/client';
import { ROLES_KEY } from '../../src/auth/roles.decorator';
import { UsersController } from '../../src/users/users.controller';
import { UsersService } from '../../src/users/users.service';

describe('user security boundaries', () => {
  it('marks administrative user endpoints as ADMIN-only', () => {
    expect(Reflect.getMetadata(ROLES_KEY, UsersController)).toEqual([Role.ADMIN]);
    expect(Reflect.getMetadata(ROLES_KEY, UsersController.prototype.options)).toEqual([Role.ADMIN, Role.IT_SUPPORT]);
  });

  it('uses an explicit projection that excludes password', async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const service = new UsersService({ user: { findMany } } as never);
    await service.findAllPublic();
    expect(findMany.mock.calls[0][0].select.password).toBeUndefined();
  });

  it('ignores password and unknown fields during administrative update', async () => {
    const update = jest.fn().mockResolvedValue({ id: 'target' });
    const service = new UsersService({
      user: { findUnique: jest.fn().mockResolvedValue({ id: 'target', role: Role.END_USER, isActive: true }), update },
    } as never);
    await service.updateAdministrative('target', { firstName: 'Safe', password: 'mass-assigned', evil: true } as never, 'admin');
    expect(update.mock.calls[0][0].data).toEqual({ firstName: 'Safe' });
  });
});
