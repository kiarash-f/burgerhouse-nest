// src/config/db.config.ts
import { registerAs } from '@nestjs/config';
export default registerAs('db', () => ({
  type: 'sqlite' as const,
  database: process.env.DB_FILE ?? 'db.sqlite',
  // prod: synchronize=false و migration
  synchronize: process.env.TYPEORM_SYNC === 'true',
}));
