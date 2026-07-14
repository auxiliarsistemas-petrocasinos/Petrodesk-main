import { NestFactory } from '@nestjs/core';
import { ExpressAdapter, NestExpressApplication } from '@nestjs/platform-express';
import express from 'express';
import { AppModule } from './app.module';
import { configureApplication } from './app.bootstrap';

let cachedServer: express.Express | undefined;

export const createNestServer = async (): Promise<express.Express> => {
  const expressInstance = express();
  const app = await NestFactory.create<NestExpressApplication>(AppModule, new ExpressAdapter(expressInstance));
  configureApplication(app);
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
