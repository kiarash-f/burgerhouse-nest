// src/config/index.ts
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import app from './app.config';
import auth from './auth.config';
import google from './google.config';
import db from './db.config';
import dinein from './dinein.config'; // 👈 ADD

export const AppConfigModule = ConfigModule.forRoot({
  isGlobal: true,
  load: [app, auth, google, db, dinein], // 👈 ADD dinein here
  validationSchema: Joi.object({
    NODE_ENV: Joi.string()
      .valid('development', 'test', 'production')
      .default('development'),
    APP_PORT: Joi.number().default(3000),

    JWT_ACCESS_SECRET: Joi.string().required(),
    JWT_ACCESS_EXPIRES: Joi.string().default('15m'),
    JWT_REFRESH_SECRET: Joi.string().required(),
    JWT_REFRESH_EXPIRES: Joi.string().default('7d'),

    GOOGLE_CLIENT_ID: Joi.string().required(),
    GOOGLE_CLIENT_SECRET: Joi.string().required(),
    GOOGLE_CALLBACK_URL: Joi.string().uri().required(),

    DB_FILE: Joi.string().default('db.sqlite'),
    TYPEORM_SYNC: Joi.boolean().default(false),

    COOKIE_SAMESITE: Joi.string().valid('lax', 'strict', 'none').default('lax'),
    COOKIE_PATH: Joi.string().default('/auth'),

    // 👇 NEW: Dine-in envs
    DINE_IN_SECRET: Joi.string().required(),
    DINE_IN_SESSION_TTL_HOURS: Joi.number().integer().min(1).default(4),
    DINE_IN_COOKIE_SECURE: Joi.boolean().default(false),
    DINE_IN_COOKIE_SAMESITE: Joi.string()
      .valid('lax', 'strict', 'none')
      .default('lax'),
    // (optional) you can add a separate DINE_IN_COOKIE_PATH if you want:
    // DINE_IN_COOKIE_PATH: Joi.string().default('/'),
  }),
});
