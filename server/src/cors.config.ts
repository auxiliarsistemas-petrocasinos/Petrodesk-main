export function allowedCorsOrigins(environment: NodeJS.ProcessEnv = process.env): string[] {
  const configured = environment.CORS_ORIGINS?.split(',').map((origin) => origin.trim()).filter(Boolean) ?? [];
  if (environment.NODE_ENV === 'production' && configured.length === 0) {
    throw new Error('CORS_ORIGINS is required in production');
  }
  return configured.length > 0 ? configured : ['http://localhost:5173', 'http://127.0.0.1:5173'];
}
