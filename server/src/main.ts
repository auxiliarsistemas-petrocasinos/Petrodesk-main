import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication, ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

let cachedServer: express.Express | undefined;

export const createNestServer = async () => {
  const expressInstance = express();

  // CORS Middleware nativo de Express para resolver el preflight inmediatamente en Vercel
  expressInstance.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }
    next();
  });

  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(expressInstance),
  );
  
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  await app.init();
  return expressInstance;
};

if (!process.env.VERCEL) {
  createNestServer().then(server => {
    server.listen(3000, () => {
      console.log('Server is running on port 3000');
    });
  });
}

// Exportación como función Serverless para Vercel
export default async (req: any, res: any) => {
  if (!cachedServer) {
    cachedServer = await createNestServer();
  }
  return cachedServer(req, res);
};
