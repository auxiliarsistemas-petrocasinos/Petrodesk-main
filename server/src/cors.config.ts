/** Pattern that matches Vercel preview deployment URLs for this project. */
const VERCEL_PREVIEW_PATTERN =
  /^https:\/\/petrodesk-frontend(-[a-z0-9]+)*(-auxiliar-sistemas-projects)?\.vercel\.app$/;

export type CorsOriginCallback = (
  origin: string | undefined,
  callback: (err: Error | null, allow?: boolean) => void,
) => void;

export function allowedCorsOrigins(environment: NodeJS.ProcessEnv = process.env): CorsOriginCallback {
  const production = environment.NODE_ENV === 'production';
  const configured = environment.CORS_ORIGINS?.split(',').map((o) => o.trim()).filter(Boolean) ?? [];

  if (production && configured.length === 0) {
    throw new Error('CORS_ORIGINS is required');
  }

  const staticOrigins = new Set([
    ...configured,
    ...(production ? [] : ['http://localhost:5173', 'http://127.0.0.1:5173']),
    'https://petrodesk-frontend.vercel.app',
  ]);

  return (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (server-to-server, curl, mobile apps)
    if (!origin) return callback(null, true);
    if (staticOrigins.has(origin)) return callback(null, true);
    if (VERCEL_PREVIEW_PATTERN.test(origin)) return callback(null, true);
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  };
}

