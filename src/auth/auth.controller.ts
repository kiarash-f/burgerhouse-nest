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
import { toUserDto } from 'src/users/dtos/to-user-dto';
import { ForgotPasswordDto } from '../users/dtos/forgot-password.dto';
import { ResetPasswordDto } from '../users/dtos/reset-password.dto';

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

    res?.cookie(
      'refresh_token',
      result.refreshToken,
      buildCookieOpts(this.cfg),
    );
    return { user: toUserDto(result.user), accessToken: result.accessToken };
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
    return { user: toUserDto(result.user), accessToken: result.accessToken };
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
    const { userId } = req.user as { userId: number; email: string };

    const tokens = await this.auth.issueTokens(userId);

    res.cookie('refresh_token', tokens.refreshToken, buildCookieOpts(this.cfg));

    const user = await this.users.findOne(userId);

    const safeUser = toUserDto(user);

    return {
      user: safeUser,
      accessToken: tokens.accessToken,
    };
  }

  // -------- Token Refresh / Logout --------
  @Post('refresh')
  @UseGuards(AuthGuard('jwt-refresh'))
  @HttpCode(200)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const payload = req.user as any;
    const raw = (req as any).cookies?.['refresh_token'] ?? payload?.token;
    const tokens = await this.auth.rotateRefreshToken(Number(payload.sub), raw);
    res.cookie('refresh_token', tokens.refreshToken, buildCookieOpts(this.cfg));
    return { accessToken: tokens.accessToken };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: { userId: number }) {
    const me = await this.users.findOne(user.userId);

    return toUserDto(me);
  }

  @Post('logout')
  @HttpCode(200)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const raw = (req as any).cookies?.['refresh_token'];
    if (raw) {
      try {
        await this.auth.revokeByRaw(raw);
      } catch (err) {}
    }

    const opts = buildCookieOpts(this.cfg);
    res.clearCookie('refresh_token', { path: opts.path });

    return { success: true, message: 'Logged out successfully' };
  }

  @Post('forgot-password')
  @HttpCode(200)
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.auth.requestPasswordReset(body.email);
  }

  @Post('reset-password')
  @HttpCode(200)
  async resetPassword(@Body() body: ResetPasswordDto) {
    return this.auth.resetPassword(body.token, body.newPassword);
  }
}
