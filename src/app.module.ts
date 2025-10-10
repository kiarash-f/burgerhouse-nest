// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigModule } from './config';
import { ConfigService, ConfigType } from '@nestjs/config';
import dbConfig from './config/db.config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ItemModule } from './item/item.module';
import { CategoriesModule } from './categories/categories.module';
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './orders/orders.module';
import { MediaModule } from './media/media.module';
import { MenuModule } from './menu/menu.module';
import { LoggerModule } from 'nestjs-pino';
import { DineInModule } from './dinein/dinein.module';

@Module({
  imports: [
    AppConfigModule,
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => {
        const db = cfg.get<ConfigType<typeof dbConfig>>('db')!;
        return {
          type: db.type,
          database: db.database,
          autoLoadEntities: true,
          synchronize: db.synchronize,
          migrations: ['dist/database/migrations/*.js'],
        };
      },
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        level:
          process.env.LOG_LEVEL ??
          (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
        transport:
          process.env.NODE_ENV === 'production'
            ? undefined
            : {
                target: 'pino-pretty',
                options: {
                  singleLine: false,
                  colorize: true,
                  translateTime: 'SYS:standard',
                  crlf: true,
                  messageFormat:
                    '{req.method} {req.url} -> {res.statusCode} ({responseTime}ms) {context}',
                },
              },

        // Correlation ID for each request:
        genReqId: (req, res) =>
          (req.headers['x-request-id'] as string) ?? crypto.randomUUID(),
        customProps: (req) => ({ reqId: (req as any).id }),
        // Redact sensitive data:
        redact: {
          paths: [
            'req.headers.authorization',
            'req.headers.cookie',
            'req.body.password',
            'req.body.newPassword',
            'req.query.token',
            'res.headers.set-cookie',
            'res.headers["set-cookie"]',
          ],
          remove: true,
        },
        // Auto HTTP logging (skip health if you add one later):
        // autoLogging: { ignorePaths: ['/health'] },
        // Map status -> level
        customLogLevel: (req, res, err) => {
          if (err || res.statusCode >= 500) return 'error';
          if (res.statusCode >= 400) return 'warn';
          return 'info';
        },
      },
    }),
    UsersModule,
    AuthModule,
    ItemModule,
    CategoriesModule,
    CartModule,
    OrdersModule,
    MediaModule,
    MenuModule,
    DineInModule,
  ],
})
export class AppModule {}
