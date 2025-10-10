import { registerAs } from '@nestjs/config';

function toSameSite(value: string | undefined): 'Lax' | 'Strict' | 'None' {
  switch ((value ?? 'lax').toLowerCase()) {
    case 'strict':
      return 'Strict';
    case 'none':
      return 'None';
    default:
      return 'Lax';
  }
}

function toSameSiteLower(value?: string): 'lax' | 'strict' | 'none' {
  const v = (value ?? 'lax').toLowerCase();
  return v === 'strict' ? 'strict' : v === 'none' ? 'none' : 'lax';
}

export default registerAs('dinein', () => ({
  secret: process.env.DINE_IN_SECRET || 'change-me',
  sessionTtlHours: Number(process.env.DINE_IN_SESSION_TTL_HOURS ?? 4),
  cookie: {
    name: 'dine_sid',
    secure: String(process.env.DINE_IN_COOKIE_SECURE ?? 'false') === 'true',
    sameSite: toSameSiteLower(process.env.DINE_IN_COOKIE_SAMESITE),
    path: '/', // valid for all routes
  },
}));
