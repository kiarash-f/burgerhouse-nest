// src/main.ts
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { Logger } from 'nestjs-pino';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  // bufferLogs lets nestjs-pino take over cleanly once resolved
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // Use nestjs-pino logger that you registered in AppModule
  app.useLogger(app.get(Logger));

  // Middlewares
  app.use(cookieParser());

  // Global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      forbidUnknownValues: false,
    }),
  );

  // Small hardening
  (app as any).set('etag', false);
  app.use((req, res, next) => {
    res.removeHeader('x-powered-by');
    res.removeHeader('date');
    next();
  });

  // CORS for your frontend (adjust origin as needed)
  app.enableCors({
    origin: true, // allow any http origin (localhost, 127.0.0.1, etc.)
    credentials: false,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Use APP_PORT if present; fall back to PORT then 3000
  const port = Number(process.env.APP_PORT || process.env.PORT || 3000);
  const host = process.env.APP_HOST || '0.0.0.0';
  

  // Always print something to the console so you can see it started
  // eslint-disable-next-line no-console
  console.log(`Starting Nest on http://${host}:${port} ...`);

  await app.listen(port, host);

  // eslint-disable-next-line no-console
  console.log(`✅ Nest application listening on http://${host}:${port}`);
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('❌ Nest failed to start:', err);
  process.exit(1);
});
