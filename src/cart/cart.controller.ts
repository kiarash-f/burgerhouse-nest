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
} from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { AddToCartDto } from './dtos/add-to-cart.dto';
import { UpdateCartItemDto } from './dtos/update-cart-item.dto';

@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly svc: CartService) {}

  @Get()
  list(@CurrentUser() user: { userId: number }) {
    return this.svc.list(user.userId);
  }

  @Post()
  add(@CurrentUser() user: { userId: number }, @Body() dto: AddToCartDto) {
    return this.svc.add(user.userId, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: { userId: number },
    @Param('id', ParseIntPipe) id: number,
    @Body() patch: UpdateCartItemDto,
  ) {
    return this.svc.update(user.userId, id, patch);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: { userId: number },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.svc.remove(user.userId, id);
  }

  @Delete()
  clear(@CurrentUser() user: { userId: number }) {
    return this.svc.clear(user.userId);
  }
}
