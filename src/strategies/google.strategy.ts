// src/strategies/google.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth/auth.service';
import type { Request } from 'express';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly cfg: ConfigService,
    private readonly auth: AuthService,
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
    _req: Request,
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ) {
    try {
      const provider = 'google';
      const providerId = profile.id;

      const email =
        profile.emails && profile.emails[0] ? profile.emails[0].value : null;

      const firstName = profile.name?.givenName ?? '';
      const lastName = profile.name?.familyName ?? '';

      if (!email) {
        // ❌ قبلاً: done(new Error(...), null)
        return done(
          new Error('Google account did not provide an email'),
          false,
        );
      }

      const { user } = await this.auth.validateOAuthLogin(
        provider,
        providerId,
        email,
        firstName,
        lastName,
      );

      // فقط payload سبک به req.user پاس بده
      return done(null, { userId: user.id, email: user.email });
    } catch (err) {
      // ❌ قبلاً: done(err as any, null)
      return done(err as any, false);
    }
  }
}
