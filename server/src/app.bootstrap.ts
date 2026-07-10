import { INestApplication, ValidationPipe } from '@nestjs/common';
import { allowedCorsOrigins } from './cors.config';

export function configureApplication(app: INestApplication): void {
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  app.enableCors({ origin: allowedCorsOrigins(), credentials: false, methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Accept', 'Authorization'] });
}
