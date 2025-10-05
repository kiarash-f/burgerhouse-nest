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
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { CreateOrderDto } from './dtos/create-order.dto';
import { UpdateOrderStatusDto } from './dtos/update-order-status.dto';

@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly svc: OrdersService) {}

  // Checkout: create order from current cart
  @Post()
  createFromCart(
    @CurrentUser() user: { userId: number },
    @Body() dto: CreateOrderDto,
  ) {
    return this.svc.createFromCart(user.userId, dto);
  }

  // User's orders
  @Get()
  listMine(@CurrentUser() user: { userId: number }) {
    return this.svc.listMine(user.userId);
  }

  @Get(':id')
  findMine(
    @CurrentUser() user: { userId: number },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.svc.findMine(user.userId, id);
  }

  // User cancel
  @Delete(':id')
  cancelMine(
    @CurrentUser() user: { userId: number },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.svc.cancelMine(user.userId, id);
  }

  // --- Admin endpoints ---
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get('admin/all')
  adminList() {
    return this.svc.adminList();
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Patch('admin/:id/status')
  adminUpdateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.svc.adminUpdateStatus(id, dto.status);
  }
}
