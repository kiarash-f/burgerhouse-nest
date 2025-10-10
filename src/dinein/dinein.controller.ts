import {
  Controller,
  Post,
  Body,
  Res,
  HttpCode,
  BadRequestException,
} from '@nestjs/common';
import type { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { TableTokenService } from './table-token.service';
import { StartSessionDto } from './dtos/start-session.dto';
import { ConfigService, ConfigType } from '@nestjs/config';
import dineinConfig from '../config/dinein.config';

@Controller('dinein')
export class DineInController {
  constructor(
    private readonly tokens: TableTokenService,
    private readonly cfg: ConfigService,
  ) {}

  private cookieOpts() {
    const d = this.cfg.get<ConfigType<typeof dineinConfig>>('dinein')!;
    return {
      httpOnly: true,
      secure: d.cookie.secure,
      sameSite: d.cookie.sameSite,
      path: d.cookie.path,
      maxAge: d.sessionTtlHours * 60 * 60 * 1000,
      name: d.cookie.name,
    } as const;
  }

  @Post('session')
  @HttpCode(200)
  startSession(
    @Body() body: StartSessionDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!body?.tt) throw new BadRequestException('Missing table token');

    const payload = this.tokens.verify(body.tt); // throws if invalid/expired
    const tableId = Number(payload.tid);
    if (!Number.isInteger(tableId) || tableId <= 0) {
      throw new BadRequestException('Invalid table id in token');
    }

    // Mint a new anonymous sessionId and set cookie
    const sessionId = uuidv4();
    const opts = this.cookieOpts();

    res.cookie(opts.name, sessionId, {
      httpOnly: opts.httpOnly,
      secure: opts.secure,
      sameSite: opts.sameSite,
      path: opts.path,
      maxAge: opts.maxAge,
    });

    // Return minimal client info (no secrets)
    return { tableId, sessionId };
  }
}
