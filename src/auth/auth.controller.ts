import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  Res,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { AuthService } from './auth.service';
import { ConfigService, ConfigType } from '@nestjs/config';
import authConfig from '../config/auth.config';
import type { Request, Response } from 'express';
import { UsersService } from '../users/users.service';

function buildCookieOpts(cfg: ConfigService) {
  const auth = cfg.get<ConfigType<typeof authConfig>>('auth')!;
  return {
    httpOnly: true,
    secure: auth.cookie.secure,
    sameSite: auth.cookie.sameSite,
    path: auth.cookie.path,
  } as const;
}

@Controller('auth')
export class AuthController {
  constructor(
    private auth: AuthService,
    private cfg: ConfigService,
    private readonly users: UsersService,
  ) {}

  // -------- Local Auth --------
  @Post('signup')
  async signup(
    @Body('email') email: string,
    @Body('password') password: string,
    @Body('name') name: string,
    @Body('lastname') lastname: string,
    @Body('mobile') mobile: string,
    @Body('address') address?: string,
    @Res({ passthrough: true }) res?: Response,
  ) {
    const result = await this.auth.signup(
      email,
      password,
      name,
      lastname,
      mobile,
      address,
    );
    // اگر می‌خوای بعد Signup هم کوکی ست بشه (تجربه بهتر):
    res?.cookie(
      'refresh_token',
      result.refreshToken,
      buildCookieOpts(this.cfg),
    );
    return { user: result.user, accessToken: result.accessToken };
  }

  @Post('signin')
  @HttpCode(200)
  async signin(
    @Body('email') email: string,
    @Body('password') password: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.auth.signin(email, password);
    res.cookie('refresh_token', result.refreshToken, buildCookieOpts(this.cfg));
    return { user: result.user, accessToken: result.accessToken };
  }

  // -------- Google OAuth --------
  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleLogin() {
    // Passport Google redirect
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    // req.user باید حداقل userId داشته باشد (در google.strategy تنظیم شده)
    const { userId } = req.user as any;
    const tokens = await this.auth.issueTokens(Number(userId));
    res.cookie('refresh_token', tokens.refreshToken, buildCookieOpts(this.cfg));
    return { accessToken: tokens.accessToken };
  }

  // -------- Token Refresh / Logout --------
  @Post('refresh')
  @UseGuards(AuthGuard('jwt-refresh'))
  @HttpCode(200)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const payload = req.user as any; // از استراتژی: { sub, token? }
    const raw = (req as any).cookies?.['refresh_token'] ?? payload?.token;
    const tokens = await this.auth.rotateRefreshToken(Number(payload.sub), raw);
    res.cookie('refresh_token', tokens.refreshToken, buildCookieOpts(this.cfg));
    return { accessToken: tokens.accessToken };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: { userId: number }) {
    // user.userId از JwtStrategy.validate می‌آد
    const me = await this.users.findOne(user.userId);
    // اگر password select:false هست، همین برمی‌گرده بدون پسورد
    return me;
  }

  // --- خروج از همین سشن (revocation + پاک کردن کوکی) ---
  @Post('logout')
  @HttpCode(200)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const raw = (req as any).cookies?.['refresh_token'];
    if (raw) await this.auth.revokeByRaw(raw);
    res.clearCookie('refresh_token', { path: '/auth' }); // اگر path در config چیز دیگری است همان را بگذار
    return { success: true };
  }
}
