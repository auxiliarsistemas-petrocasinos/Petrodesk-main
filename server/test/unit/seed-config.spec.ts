import { requireDevelopmentSeedPassword } from '../../prisma/seed-config';

describe('development seed configuration', () => {
  it('never runs in production', () => {
    expect(() => requireDevelopmentSeedPassword({ NODE_ENV: 'production', PETRODESK_SEED_PASSWORD: 'a'.repeat(12) })).toThrow('disabled');
  });
  it('requires an explicit non-trivial development credential', () => {
    expect(() => requireDevelopmentSeedPassword({ NODE_ENV: 'development' })).toThrow('required');
  });
});
