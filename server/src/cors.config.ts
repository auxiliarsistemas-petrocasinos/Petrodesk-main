export function allowedCorsOrigins(environment: NodeJS.ProcessEnv = process.env): string[] {
  const configured = environment.CORS_ORIGINS?.split(',').map((origin) => origin.trim()).filter(Boolean) ?? [];
  const defaultOrigins = [
    'http://localhost:5173', 
    'http://127.0.0.1:5173',
    'https://petrodesk-frontend.vercel.app'
  ];
  return configured.length > 0 ? Array.from(new Set([...configured, ...defaultOrigins])) : defaultOrigins;
}
