import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { OrderStatus } from './order-status.enum';
import { CreateOrderDto } from './dtos/create-order.dto';
import { CartService } from '../cart/cart.service';

@Injectable()
export class OrdersService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Order) private readonly orders: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItems: Repository<OrderItem>,
    private readonly cartService: CartService,
  ) {}

  // Create an order from the user's current cart
  async createFromCart(userId: number, dto: CreateOrderDto) {
    const cart = await this.cartService.list(userId);
    if (cart.items.length === 0) throw new BadRequestException('Cart is empty');

    // Use a transaction to create order + items + clear cart atomically
    return this.dataSource.transaction(async (manager) => {
      const subtotal = cart.items.reduce(
        (sum, row) => sum + row.quantity * Number(row.item.price),
        0,
      );
      const deliveryFee = 0; // extend later
      const total = subtotal + deliveryFee;

      const order = manager.create(Order, {
        userId,
        subtotal: subtotal.toFixed(2),
        deliveryFee: deliveryFee.toFixed(2),
        total: total.toFixed(2),
        status: OrderStatus.PENDING,
        address: dto.address ?? null,
        paymentMethod: dto.paymentMethod ?? null,
        note: dto.note ?? null,
      });
      await manager.save(order);

      const items = cart.items.map((ci) =>
        manager.create(OrderItem, {
          orderId: order.id,
          itemId: ci.item.id,
          name: ci.item.name,
          desc: ci.item.desc ?? null,
          price: Number(ci.item.price).toFixed(2),
          quantity: ci.quantity,
          note: ci.note ?? null,
        }),
      );
      await manager.save(items);

      // Clear cart
      await this.cartService.clear(userId);

      // Return with eager items
      const saved = await manager.findOne(Order, {
        where: { id: order.id },
        relations: ['items'],
      });
      return saved!;
    });
  }

  // User: list own orders
  async listMine(userId: number) {
    return this.orders.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  // User: get specific order (must own it)
  async findMine(userId: number, id: number) {
    const order = await this.orders.findOne({
      where: { id },
      relations: ['items'],
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.userId !== userId) throw new ForbiddenException('Not your order');
    return order;
  }

  // User: cancel own order (allowed only if not advanced too far)
  async cancelMine(userId: number, id: number) {
    const order = await this.orders.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');
    if (order.userId !== userId) throw new ForbiddenException('Not your order');

    if ([OrderStatus.DELIVERED, OrderStatus.CANCELLED].includes(order.status)) {
      throw new BadRequestException(`Order already ${order.status}`);
    }
    // business rule: allow cancel only if not READY/DELIVERED (adjust as needed)
    if ([OrderStatus.PREPARING, OrderStatus.READY].includes(order.status)) {
      throw new BadRequestException('Order cannot be cancelled at this stage');
    }

    order.status = OrderStatus.CANCELLED;
    return this.orders.save(order);
  }

  // Admin: list all
  async adminList() {
    return this.orders.find({ order: { createdAt: 'DESC' } });
  }

  // Admin: update status
  async adminUpdateStatus(id: number, status: OrderStatus) {
    const order = await this.orders.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');
    order.status = status;
    return this.orders.save(order);
  }
}
