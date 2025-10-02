// src/auth/strategies/jwt-refresh.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(cfg: ConfigService) {
    super({
      jwtFromRequest: (req: Request) => req.cookies?.['refresh_token'] ?? null,
      secretOrKey: cfg.get('auth.refreshSecret')!,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    const token = req.cookies['refresh_token'];
    return { sub: payload.sub, token };
  }
}
