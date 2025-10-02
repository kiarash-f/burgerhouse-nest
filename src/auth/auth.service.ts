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
import { Repository } from 'typeorm';
import { RefreshToken } from '../entities/refresh-token.entity';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { User } from '../entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private users: UsersService,
    private jwt: JwtService,
    private cfg: ConfigService,
    @InjectRepository(RefreshToken)
    private rtRepo: Repository<RefreshToken>,
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

    // ساخت User entity برای رابطه
    const userEntity = new User();
    userEntity.id = userId;

    // ساخت RefreshToken entity به‌صورت دستی (برای رضایت TS)
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

    // کاربر محلی را می‌سازیم (بدون برگرداندن پسورد در پاسخ)
    const newUser = await this.users.create({
      email,
      name,
      lastname,
      mobile,
      address,
    } as any);

    // ذخیره‌ی هش پسورد در DB (ست کردن مستقیم فقط فیلد لازم)
    await this.users.update(newUser.id, { password: hash } as any);

    const tokens = await this.issueTokens(newUser.id);

    // مطمئن شو password در خروجی نیست
    return { user: newUser, ...tokens };
  }

  async signin(email: string, password: string) {
    const user = (await this.users.findByEmailWithPassword(
      email,
    )) as UserWithPassword | null;

    if (!user) throw new NotFoundException('user not found');

    const passwordHash = user.password;
    if (!passwordHash) {
      // کاربر احتمالاً با Google ساخته شده است
      throw new UnauthorizedException('No password set for this user');
    }

    const valid = await argon2.verify(passwordHash, password);
    if (!valid) throw new UnauthorizedException('wrong password');

    const tokens = await this.issueTokens(user.id);

    // password را از آبجکت پاک کنیم (هرچند select:false بوده)
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
}
