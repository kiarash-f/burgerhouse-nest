// src/cart/cart.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import type { Request } from 'express';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { AddToCartDto } from './dtos/add-to-cart.dto';
import { UpdateCartItemDto } from './dtos/update-cart-item.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly svc: CartService) {}

  // ========= AUTHENTICATED USER CART (unchanged) =========
  @UseGuards(JwtAuthGuard)
  @Get()
  list(@CurrentUser() user: { userId: number }) {
    return this.svc.list(user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  add(@CurrentUser() user: { userId: number }, @Body() dto: AddToCartDto) {
    return this.svc.add(user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @CurrentUser() user: { userId: number },
    @Param('id', ParseIntPipe) id: number,
    @Body() patch: UpdateCartItemDto,
  ) {
    return this.svc.update(user.userId, id, patch);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(
    @CurrentUser() user: { userId: number },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.svc.remove(user.userId, id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete()
  clear(@CurrentUser() user: { userId: number }) {
    return this.svc.clear(user.userId);
  }

  // ========= DINE-IN (ANONYMOUS SESSION) CART =========
  // Reads "dine_sid" (HttpOnly) from cookies set by POST /dinein/session

  private getSessionIdOrThrow(req: Request) {
    const sid = (req as any).cookies?.['dine_sid'] as string | undefined;
    if (!sid)
      throw new BadRequestException('No dine-in session (cookie missing)');
    return sid;
  }

  @Get('dinein')
  listDineIn(@Req() req: Request) {
    const sessionId = this.getSessionIdOrThrow(req);
    return this.svc.listBySession(sessionId);
  }

  @Post('dinein')
  addDineIn(@Req() req: Request, @Body() dto: AddToCartDto) {
    const sessionId = this.getSessionIdOrThrow(req);
    return this.svc.addBySession(sessionId, dto);
  }

  @Patch('dinein/:id')
  updateDineIn(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body() patch: UpdateCartItemDto,
  ) {
    const sessionId = this.getSessionIdOrThrow(req);
    return this.svc.updateBySession(sessionId, id, patch);
  }

  @Delete('dinein/:id')
  removeDineIn(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    const sessionId = this.getSessionIdOrThrow(req);
    return this.svc.removeBySession(sessionId, id);
  }

  @Delete('dinein')
  clearDineIn(@Req() req: Request) {
    const sessionId = this.getSessionIdOrThrow(req);
    return this.svc.clearBySession(sessionId);
  }
}
