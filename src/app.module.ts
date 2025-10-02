import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigModule } from './config';
import { ConfigService, ConfigType } from '@nestjs/config';
import dbConfig from './config/db.config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

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
          autoLoadEntities: true, // ✅ باید همین‌جا باشه
          synchronize: db.synchronize, // ✅ برای dev باید true باشه
          migrations: ['dist/database/migrations/*.js'],
        };
      },
    }),
    UsersModule,
    AuthModule,
  ],
})
export class AppModule {}
