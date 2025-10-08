import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { Logger } from 'nestjs-pino';
const cookieParser = require('cookie-parser');

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    logger: false,
  });
  app.useLogger(app.get(Logger));
  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  (app as any).set('etag', false);
  app.use((req, res, next) => {
    res.removeHeader('x-powered-by');
    res.removeHeader('date');
    next();
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
