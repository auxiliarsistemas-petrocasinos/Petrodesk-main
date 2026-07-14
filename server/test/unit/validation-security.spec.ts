import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { LoginDto } from '../../src/auth/auth.dto';
import { allowedCorsOrigins } from '../../src/cors.config';

describe('global validation and CORS configuration', () => {
  it('rejects malformed login payloads', async () => {
    const dto = plainToInstance(LoginDto, { username: '', password: 'short' });
    expect(await validate(dto)).toHaveLength(2);
  });

  it('fails closed without production CORS origins', () => {
    expect(() => allowedCorsOrigins({ NODE_ENV: 'production' })).toThrow('CORS_ORIGINS is required');
  });

  it('allows only local development defaults outside production', () => {
    expect(allowedCorsOrigins({ NODE_ENV: 'development' })).toEqual(['http://localhost:5173', 'http://127.0.0.1:5173']);
  });
});
