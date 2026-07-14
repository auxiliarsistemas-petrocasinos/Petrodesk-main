import { requireJwtSecret } from '../../src/auth/auth.config';

describe('JWT configuration', () => {
  it('fails closed when JWT_SECRET is absent', () => {
    expect(() => requireJwtSecret({})).toThrow('JWT_SECRET is required');
  });

  it('rejects weak JWT secrets', () => {
    expect(() => requireJwtSecret({ JWT_SECRET: 'too-short' })).toThrow('at least 32 characters');
  });

  it('accepts a sufficiently long environment secret', () => {
    expect(requireJwtSecret({ JWT_SECRET: 'a'.repeat(32) })).toHaveLength(32);
  });
});
