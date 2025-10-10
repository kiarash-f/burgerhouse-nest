import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';

import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { CartItem } from '../entities/cart-item.entity';
import { Item } from '../entities/item.entity';

import { CartModule } from '../cart/cart.module';
import { OrdersEventsGateway } from './ws/orders.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, CartItem, Item]),
    CartModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersEventsGateway], // one gateway instance
  exports: [OrdersService],
})
export class OrdersModule {}
