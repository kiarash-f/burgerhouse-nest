import {
  Controller,
  Post,
  Get,
  Param,
  ParseIntPipe,
  Body,
  Patch,
  UseGuards,
  Delete,
  Req,
  HttpCode,
  BadRequestException,
} from '@nestjs/common';
import type { Request } from 'express';

import { OrdersService } from './orders.service';

import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';

import { CreateOrderDto } from './dtos/create-order.dto';
import { UpdateOrderStatusDto } from './dtos/update-order-status.dto';
import { DineInSubmitDto } from './dtos/dinein-submit.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly order: OrdersService) {}

  // ---------- USER (JWT) ----------
  @UseGuards(JwtAuthGuard)
  @Post()
  createFromCart(
    @CurrentUser() user: { userId: number },
    @Body() dto: CreateOrderDto,
  ) {
    return this.order.createFromCart(user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  listMine(@CurrentUser() user: { userId: number }) {
    return this.order.listMine(user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findMine(
    @CurrentUser() user: { userId: number },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.order.findMine(user.userId, id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  cancelMine(
    @CurrentUser() user: { userId: number },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.order.cancelMine(user.userId, id);
  }

  // ---------- ADMIN (JWT + Role) ----------
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin/all')
  adminList() {
    return this.order.adminList();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch('admin/:id/status')
  adminUpdateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.order.adminUpdateStatus(id, dto.status);
  }

  // Optional: quick manual broadcast test to verify WS end-to-end
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin/test-broadcast')
  testBroadcast() {
    return this.order.testBroadcast();
  }

  // ---------- DINE-IN (PUBLIC; cookie-based session) ----------
  @Post('dinein/submit')
  @HttpCode(200)
  async submitDineIn(@Req() req: Request, @Body() body: DineInSubmitDto) {
    const sessionId = (req as any).cookies?.['dine_sid'] as string;
    if (!sessionId) throw new BadRequestException('No dine-in session');
    console.log(sessionId);

    const saved = await this.order.submitDineInFromSession(
      sessionId,
      body.note,
    );
    console.log(saved);
    return {
      orderId: saved.id,
      status: saved.status,
      tableId: (saved as any).tableId ?? null, // future-proof if you add tableId
    };
  }
}
