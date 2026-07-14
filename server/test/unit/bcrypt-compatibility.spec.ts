import * as bcrypt from 'bcrypt';

describe('bcrypt compatibility', () => {
  const legacyHash =
    '$2b$10$NvF0BzaClblivqK4iICCPOGLugL4iA1mlTVG8/VjBD8EOAIVtaO/2';

  it('validates hashes created before the bcrypt 6 upgrade', async () => {
    await expect(bcrypt.compare('P1-Legacy123!', legacyHash)).resolves.toBe(true);
    await expect(bcrypt.compare('incorrect', legacyHash)).resolves.toBe(false);
  });

  it('keeps the configured cost when creating new hashes', async () => {
    const hash = await bcrypt.hash('P1-Compatible123!', 10);

    expect(hash).toMatch(/^\$2[aby]\$10\$/);
    await expect(bcrypt.compare('P1-Compatible123!', hash)).resolves.toBe(true);
  });
});
