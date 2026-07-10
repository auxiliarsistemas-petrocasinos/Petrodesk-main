import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter, NestExpressApplication } from '@nestjs/platform-express';
import express from 'express';
import { AppModule } from './app.module';
import { allowedCorsOrigins } from './cors.config';

let cachedServer: express.Express | undefined;

export const createNestServer = async (): Promise<express.Express> => {
  const expressInstance = express();
  const app = await NestFactory.create<NestExpressApplication>(AppModule, new ExpressAdapter(expressInstance));
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  app.enableCors({ origin: allowedCorsOrigins(), credentials: false, methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Accept', 'Authorization'] });
  await app.init();
  return expressInstance;
};

if (!process.env.VERCEL) {
  createNestServer().then((server) => server.listen(3000));
}

export default async (req: express.Request, res: express.Response) => {
  if (!cachedServer) cachedServer = await createNestServer();
  return cachedServer(req, res);
};
