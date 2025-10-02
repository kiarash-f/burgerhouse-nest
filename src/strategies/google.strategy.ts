// src/auth/strategies/google.strategy.ts
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private cfg: ConfigService,
    private auth: AuthService,
  ) {
    super({
      clientID: cfg.get<string>('google.clientId')!,
      clientSecret: cfg.get<string>('google.clientSecret')!,
      callbackURL: cfg.get<string>('google.callbackUrl')!,
      scope: ['email', 'profile'],
      passReqToCallback: true,
    });
  }

  async validate(
    req: Request,
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ) {
    const { id, name, emails } = profile;
    const user = await this.auth.validateOAuthLogin(
      'google',
      id,
      emails[0].value,
      name.givenName,
      name.familyName,
    );
    done(null, { userId: user.user.id, email: user.user.email });
  }
}
