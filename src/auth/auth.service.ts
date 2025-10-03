// src/auth/auth.service.ts
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import type { UserWithPassword } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { RefreshToken } from '../entities/refresh-token.entity';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { User } from '../entities/user.entity';
import { PasswordResetToken } from '../entities/password-reset.entity';

@Injectable()
export class AuthService {
  constructor(
    private users: UsersService,
    private jwt: JwtService,
    private cfg: ConfigService,
    @InjectRepository(RefreshToken)
    private rtRepo: Repository<RefreshToken>,
    @InjectRepository(PasswordResetToken)
    private prtRepo: Repository<PasswordResetToken>,
  ) {}

  // ================= JWT helpers ================
  private async signAccess(userId: number, role = 'USER') {
    return this.jwt.signAsync(
      { sub: userId, role },
      {
        secret: this.cfg.get<string>('auth.accessSecret')!,
        expiresIn: this.cfg.get<string>('auth.accessExpiresIn') ?? '15m',
      },
    );
  }

  private async signRefresh(userId: number) {
    return this.jwt.signAsync(
      { sub: userId },
      {
        secret: this.cfg.get<string>('auth.refreshSecret')!,
        expiresIn: this.cfg.get<string>('auth.refreshExpiresIn') ?? '7d',
      },
    );
  }

  // ================= Tokens cycle ================
  async issueTokens(
    userId: number,
    role = 'USER',
    meta?: { ua?: string; ip?: string },
  ) {
    const [accessToken, refreshToken] = await Promise.all([
      this.signAccess(userId, role),
      this.signRefresh(userId),
    ]);

    const decoded: any = this.jwt.decode(refreshToken);
    const tokenHash = await argon2.hash(refreshToken);

    const userEntity = new User();
    userEntity.id = userId;

    const tokenEntity = new RefreshToken();
    tokenEntity.user = userEntity;
    tokenEntity.tokenHash = tokenHash;
    tokenEntity.expiresAt = new Date(decoded.exp * 1000);
    tokenEntity.userAgent = meta?.ua ?? null;
    tokenEntity.ip = meta?.ip ?? null;
    tokenEntity.revoked = false;

    await this.rtRepo.save(tokenEntity);

    return { accessToken, refreshToken };
  }

  async validateRefreshToken(userId: number, raw: string) {
    const tokens = await this.rtRepo.find({
      where: { user: { id: userId }, revoked: false } as any,
      relations: ['user'],
      order: { expiresAt: 'DESC' },
    });

    if (!tokens.length) {
      throw new UnauthorizedException('No refresh token found');
    }

    for (const t of tokens) {
      if (await argon2.verify(t.tokenHash, raw)) return true;
    }
    throw new UnauthorizedException('Invalid refresh token');
  }

  async rotateRefreshToken(userId: number, raw: string, role = 'USER') {
    await this.validateRefreshToken(userId, raw);

    const tokens = await this.rtRepo.find({
      where: { user: { id: userId }, revoked: false } as any,
      relations: ['user'],
    });

    for (const t of tokens) {
      if (await argon2.verify(t.tokenHash, raw)) {
        t.revoked = true;
        await this.rtRepo.save(t);
        break;
      }
    }

    return this.issueTokens(userId, role);
  }

  async revokeByRaw(raw: string) {
    const all = await this.rtRepo.find({ where: { revoked: false } as any });
    for (const t of all) {
      if (await argon2.verify(t.tokenHash, raw)) {
        t.revoked = true;
        await this.rtRepo.save(t);
        return;
      }
    }
  }

  // ================= Local auth =================
  async signup(
    email: string,
    password: string,
    name: string,
    lastname: string,
    mobile: string,
    address?: string,
  ) {
    const existing = await this.users.findByEmail(email);
    if (existing) throw new BadRequestException('email already in use');

    const hash = await argon2.hash(password);

    const newUser = await this.users.create({
      email,
      name,
      lastname,
      mobile,
      address,
    } as any);

    await this.users.update(newUser.id, { password: hash } as any);

    const tokens = await this.issueTokens(newUser.id);

    return { user: newUser, ...tokens };
  }

  async signin(email: string, password: string) {
    const user = (await this.users.findByEmailWithPassword(
      email,
    )) as UserWithPassword | null;

    if (!user) throw new NotFoundException('user not found');

    const passwordHash = user.password;
    if (!passwordHash) {
      throw new UnauthorizedException('No password set for this user');
    }

    const valid = await argon2.verify(passwordHash, password);
    if (!valid) throw new UnauthorizedException('wrong password');

    const tokens = await this.issueTokens(user.id);

    delete (user as any).password;

    return { user, ...tokens };
  }

  // ================= Google OAuth =================
  async validateOAuthLogin(
    provider: string,
    providerId: string,
    email: string,
    firstName: string,
    lastName: string,
  ) {
    let user = await this.users.findByProvider(provider, providerId);
    if (!user) {
      user = await this.users.createOAuthUser(
        provider,
        providerId,
        email,
        firstName,
        lastName,
      );
    }

    const tokens = await this.issueTokens(user.id);
    return { user, ...tokens };
  }
  async revokeAllForUser(userId: number) {
    await this.rtRepo
      .createQueryBuilder()
      .update(RefreshToken)
      .set({ revoked: true })
      .where('userId = :id AND revoked = :revoked', {
        id: userId,
        revoked: false,
      })
      .execute();
  }
  // ================= Password reset =================
  private resetTokenTime() {
    return 30 * 60 * 1000;
    //add this to config later
  }

  async requestPasswordReset(email: string) {
    const user = await this.users.findByEmail(email);

    const generic = {
      message:
        'If that email is registered, you will receive a password reset link.',
    };

    if (!user) return generic;

    const raw = crypto.randomBytes(32).toString('hex');
    const tokenHash = await argon2.hash(raw);

    const token = new PasswordResetToken();
    token.user = user;
    token.tokenHash = tokenHash;
    token.expiresAt = new Date(Date.now() + this.resetTokenTime());
    token.used = false;

    await this.prtRepo.save(token);

    const baseUrl = this.cfg.get<string>('app.url') ?? 'http://localhost:3000';
    const resetUrl = `${baseUrl}/reset-password?token=${raw}`;

    return {
      ...generic,
      resetUrl,
    };
  }

  async resetPassword(rawToken: string, newPassword: string) {
    const candidates = await this.prtRepo.find({
      where: { used: false },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
    let match: PasswordResetToken | null = null;

    for (const t of candidates) {
      if (t.expiresAt.getTime() < Date.now()) continue;
      if (await argon2.verify(t.tokenHash, rawToken)) {
        match = t;
        break;
      }
    }
    if (!match) throw new BadRequestException('Invalid or expired ResetToken');

    const user = match.user;

    const hash = await argon2.hash(newPassword);
    await this.users.update(user.id, { password: hash } as any);

    match.used = true;
    await this.prtRepo.save(match);

    if (typeof this.revokeAllForUser === 'function') {
      await this.revokeAllForUser(user.id);
    } else {
      const tokens = await this.rtRepo.find({
        where: { revoked: false } as any,
        relations: ['user'],
      });
      for (const rt of tokens) {
        if (rt.user.id === user.id) {
          rt.revoked = true;
          await this.rtRepo.save(rt);
        }
      }
    }
    return { message: 'Password reset successfully' };
  }
}
