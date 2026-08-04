import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { LoginDto } from '../../src/auth/auth.dto';
import { allowedCorsOrigins } from '../../src/cors.config';

describe('global validation and CORS configuration', () => {
  it('rejects malformed login payloads', async () => {
    const dto = plainToInstance(LoginDto, { username: '', password: 'short' });
    expect(await validate(dto)).toHaveLength(2);
  });

  it('defaults to production domain when CORS_ORIGINS is not set in production', () => {
    const corsCallback = allowedCorsOrigins({ NODE_ENV: 'production' });
    let allowed = false;
    corsCallback('https://petrodesk-frontend.vercel.app', (err, allow) => {
      allowed = Boolean(allow);
    });
    expect(allowed).toBe(true);
  });

  it('allows only local development defaults outside production', () => {
    const corsCallback = allowedCorsOrigins({ NODE_ENV: 'development' });
    const allowed: string[] = [];
    const denied: string[] = [];

    const origins = [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'https://evil.example.com',
    ];

    for (const origin of origins) {
      corsCallback(origin, (err, allow) => {
        if (allow) allowed.push(origin);
        else denied.push(origin);
      });
    }

    expect(allowed).toEqual(['http://localhost:5173', 'http://127.0.0.1:5173']);
    expect(denied).toEqual(['https://evil.example.com']);
  });

  it('accepts Vercel preview deployment URLs', () => {
    const corsCallback = allowedCorsOrigins({ NODE_ENV: 'development' });
    const previewOrigin = 'https://petrodesk-frontend-q8tgwcail-auxiliar-sistemas-projects.vercel.app';

    corsCallback(previewOrigin, (err, allow) => {
      expect(err).toBeNull();
      expect(allow).toBe(true);
    });
  });
});
