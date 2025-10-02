// src/config/auth.config.ts
import { registerAs } from '@nestjs/config';
export default registerAs('auth', () => ({
  accessSecret: process.env.JWT_ACCESS_SECRET!,
  accessExpiresIn: process.env.JWT_ACCESS_EXPIRES ?? '15m',
  refreshSecret: process.env.JWT_REFRESH_SECRET!,
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES ?? '7d',
  cookie: {
    sameSite: (process.env.COOKIE_SAMESITE ?? 'lax') as
      | 'lax'
      | 'strict'
      | 'none',
    secure: process.env.NODE_ENV === 'production',
    path: process.env.COOKIE_PATH ?? '/auth',
  },
}));
