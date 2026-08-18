import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const join = (await import('path')).join;

  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads',
  });

  app.enableCors({
    origin: [
      'https://medicarexpharmacyuom.netlify.app',
       'https://innovatexuom.vercel.app',
      /^http:\/\/localhost(:\d+)?$/,
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
});

  app.setGlobalPrefix('api');

  const port = process.env.PORT || 5000;
  await app.listen(port, '0.0.0.0');
  console.log(`Backend running on port ${port}`);
}

bootstrap();
