import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartItem } from '../entities/cart-item.entity';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { Item } from '../entities/item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CartItem, Item])],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}
