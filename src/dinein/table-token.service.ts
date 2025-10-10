import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export type TableTokenPayload = { tid: number; iat?: number; exp?: number };

@Injectable()
export class TableTokenService {
  constructor(private readonly jwt: JwtService) {}

  sign(tableId: number, expiresIn?: string | number) {
    // You’ll use this from an admin tool to pre-generate QR tokens
    return this.jwt.sign(
      { tid: tableId },
      expiresIn ? { expiresIn } : undefined,
    );
  }

  verify(token: string): TableTokenPayload {
    try {
      return this.jwt.verify<TableTokenPayload>(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired table token');
    }
  }
}
