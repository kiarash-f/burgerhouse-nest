import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService, ConfigType } from '@nestjs/config';
import dineinConfig from '../config/dinein.config';
import { DineInController } from './dinein.controller';
import { TableTokenService } from './table-token.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => {
        const d = cfg.get<ConfigType<typeof dineinConfig>>('dinein')!;
        return {
          secret: d.secret,
          signOptions: { expiresIn: `${d.sessionTtlHours}h` },
        };
      },
    }),
  ],
  controllers: [DineInController],
  providers: [TableTokenService],
  exports: [TableTokenService],
})
export class DineInModule {}
