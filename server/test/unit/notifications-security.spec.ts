import { NotificationsService } from '../../src/notifications/notifications.service';

describe('notification ownership', () => {
  it('updates by id and authenticated user id', async () => {
    const updateMany = jest.fn().mockResolvedValue({ count: 1 });
    const service = new NotificationsService({ notification: { updateMany } } as never);
    await expect(service.markAsRead('notification', 'owner')).resolves.toEqual({ updated: true });
    expect(updateMany.mock.calls[0][0].where).toEqual({ id: 'notification', userId: 'owner' });
  });

  it('returns the same 404 for foreign and missing notifications', async () => {
    const service = new NotificationsService({ notification: { updateMany: jest.fn().mockResolvedValue({ count: 0 }) } } as never);
    await expect(service.markAsRead('unknown-or-foreign', 'owner')).rejects.toThrow('Notificacion no encontrada');
  });
});
