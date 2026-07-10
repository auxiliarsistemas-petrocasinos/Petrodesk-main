export function requireDevelopmentSeedPassword(environment: NodeJS.ProcessEnv = process.env): string {
  if (environment.NODE_ENV === 'production') throw new Error('The development seed is disabled in production');
  const password = environment.PETRODESK_SEED_PASSWORD;
  if (!password || password.length < 12) throw new Error('PETRODESK_SEED_PASSWORD with at least 12 characters is required');
  return password;
}
