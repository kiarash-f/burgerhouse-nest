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
    UsersModule,
    AuthModule,
    ItemModule,
    CategoriesModule,
    CartModule,
    OrdersModule,
  ],
})
export class AppModule {}
