import { AuthService } from '../../src/auth/auth.service';
import { JwtStrategy } from '../../src/auth/jwt.strategy';

jest.mock('bcrypt', () => ({ compare: jest.fn() }));
import * as bcrypt from 'bcrypt';

describe('P0 security characterization', () => {
  beforeEach(() => jest.clearAllMocks());

  const user = {
    id: 'user-id',
    username: 'user',
    email: 'user@example.test',
    password: 'hash',
    role: 'END_USER',
    isActive: true,
    mustChangePassword: false,
  };

  it('accepts valid credentials without returning the password hash', async () => {
    const users = { findOne: jest.fn().mockResolvedValue(user) };
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    const service = new AuthService(users as never, { sign: jest.fn() } as never);

    await expect(service.validateUser(user.username, 'valid-password')).resolves.toEqual(
      expect.not.objectContaining({ password: expect.anything() }),
    );
  });

  it('rejects an invalid password', async () => {
    const users = { findOne: jest.fn().mockResolvedValue(user) };
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);
    const service = new AuthService(users as never, { sign: jest.fn() } as never);

    await expect(service.validateUser(user.username, 'invalid-password')).resolves.toBeNull();
  });

  it('rejects inactive users during login', async () => {
    const users = { findOne: jest.fn().mockResolvedValue({ ...user, isActive: false }) };
    const service = new AuthService(users as never, { sign: jest.fn() } as never);
    await expect(service.validateUser(user.username, 'valid-password')).resolves.toBeNull();
    expect(bcrypt.compare).not.toHaveBeenCalled();
  });

  it('rejects tokens after the user is deactivated', async () => {
    const strategy = Object.create(JwtStrategy.prototype) as JwtStrategy;
    Object.assign(strategy, { usersService: { findById: jest.fn().mockResolvedValue({ ...user, isActive: false }) } });
    await expect(strategy.validate({ sub: user.id })).rejects.toThrow();
  });

});
