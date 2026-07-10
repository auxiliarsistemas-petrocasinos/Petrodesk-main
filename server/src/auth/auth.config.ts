const MINIMUM_JWT_SECRET_LENGTH = 32;

export function requireJwtSecret(environment: NodeJS.ProcessEnv = process.env): string {
  const secret = environment.JWT_SECRET?.trim();
  if (!secret) {
    throw new Error('JWT_SECRET is required');
  }
  if (secret.length < MINIMUM_JWT_SECRET_LENGTH) {
    throw new Error(`JWT_SECRET must be at least ${MINIMUM_JWT_SECRET_LENGTH} characters`);
  }
  return secret;
}
