// src/config/app.config.ts
import { registerAs } from '@nestjs/config';
export default registerAs('app', () => ({
  env: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.APP_PORT ?? '3000', 10),
}));
