import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';

import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { Item } from '../entities/item.entity';
import { CartItem } from '../entities/cart-item.entity';

import { OrderStatus } from './order-status.enum';
import { CreateOrderDto } from './dtos/create-order.dto';

import { CartService } from '../cart/cart.service';

import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { OrdersEventsGateway } from './ws/orders.gateway';

@Injectable()
export class OrdersService {
  constructor(
    private readonly dataSource: DataSource,

    @InjectRepository(Order)
    private readonly orders: Repository<Order>,

    @InjectRepository(OrderItem)
    private readonly orderItems: Repository<OrderItem>,

    @InjectRepository(Item)
    private readonly itemsRepo: Repository<Item>,

    @InjectRepository(CartItem)
    private readonly cartRepo: Repository<CartItem>,

    private readonly cartService: CartService,

    @InjectPinoLogger(OrdersService.name)
    private readonly logger: PinoLogger,

    private readonly ws: OrdersEventsGateway,
  ) {}

  // ---------- USER CART → ORDER ----------
  async createFromCart(userId: number, dto: CreateOrderDto) {
    const cart = await this.cartService.list(userId);
    if (cart.items.length === 0) throw new BadRequestException('Cart is empty');

    return this.dataSource.transaction(async (manager) => {
      const subtotalNum = cart.items.reduce(
        (sum, row) => sum + row.quantity * Number(row.item.price),
        0,
      );
      const deliveryFeeNum = 0;
      const totalNum = subtotalNum + deliveryFeeNum;

      const order = manager.create(Order, {
        userId,
        subtotal: subtotalNum.toFixed(2), 
        deliveryFee: deliveryFeeNum.toFixed(2),
        total: totalNum.toFixed(2),
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
          price: Number(ci.item.price).toFixed(2), // DECIMAL -> string
          quantity: ci.quantity,
          note: ci.note ?? null,
        }),
      );
      await manager.save(items);

      await this.cartService.clear(userId);

      const saved = await manager.findOne(Order, {
        where: { id: order.id },
        relations: ['items'],
      });

      // (optional) emit for delivery/pickup flows if you want:
      // this.ws.notifyOrderCreated({ ... })

      return saved!;
    });
  }

  // ---------- USER QUERIES ----------
  async listMine(userId: number) {
    return this.orders.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findMine(userId: number, id: number) {
    const order = await this.orders.findOne({
      where: { id },
      relations: ['items'],
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.userId !== userId) throw new ForbiddenException('Not your order');
    return order;
  }

  async cancelMine(userId: number, id: number) {
    const order = await this.orders.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');
    if (order.userId !== userId) throw new ForbiddenException('Not your order');

    if ([OrderStatus.DELIVERED, OrderStatus.CANCELLED].includes(order.status)) {
      throw new BadRequestException(`Order already ${order.status}`);
    }
    if ([OrderStatus.PREPARING, OrderStatus.READY].includes(order.status)) {
      throw new BadRequestException('Order cannot be cancelled at this stage');
    }

    order.status = OrderStatus.CANCELLED;
    return this.orders.save(order);
  }

  // ---------- ADMIN ----------
  async adminList() {
    return this.orders.find({ order: { createdAt: 'DESC' } });
  }

  async adminUpdateStatus(id: number, status: OrderStatus) {
    const order = await this.orders.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');

    order.status = status;
    const saved = await this.orders.save(order);

    // strong logs + unconditional emit
    this.logger.info(
      { orderId: saved.id, status: saved.status },
      'Order status updated',
    );
    try {
      this.logger.info(
        { event: 'order:statusChanged', orderId: saved.id },
        'about to broadcast',
      );
      this.ws.notifyOrderStatusChanged({ id: saved.id, status: saved.status });
    } catch (e) {
      this.logger.error({ err: e }, 'broadcast failed (statusChanged)');
    }

    return saved;
  }

  // ---------- DINE-IN (PUBLIC, cookie session) ----------
  async submitDineInFromSession(sessionId: string, note?: string) {
    if (!sessionId) throw new BadRequestException('Missing dine-in session');

    try {
      // 1) get cart for this session
      const cartRows = await this.cartRepo.find({
        where: { sessionId },
        relations: ['item'],
        order: { createdAt: 'ASC' },
      });
      if (!cartRows.length) throw new BadRequestException('Cart is empty');

      // 2) validate items & compute totals with authoritative prices
      const itemIds = Array.from(new Set(cartRows.map((r) => r.itemId)));
      const fresh = await this.itemsRepo.find({ where: { id: In(itemIds) } });
      const byId = new Map(fresh.map((it) => [it.id, it]));

      let subtotalNum = 0;
      const lines = cartRows.map((r) => {
        const it = byId.get(r.itemId);
        if (!it || it.active === false) {
          throw new BadRequestException(`Item ${r.itemId} is unavailable`);
        }
        const qty = Math.max(1, Number(r.quantity || 1));
        const price = Number(it.price);
        subtotalNum += qty * price;
        return {
          itemId: it.id,
          name: it.name,
          desc: (it as any).desc ?? null,
          price, // number now; stringified when saving
          quantity: qty,
          note: r.note ?? null,
        };
      });

      const deliveryFeeNum = 0;
      const totalNum = subtotalNum + deliveryFeeNum;

      // 3) tx: save order + items, clear cart
      const saved = await this.dataSource.transaction(async (manager) => {
        const order = manager.create(Order, {
          userId: null, // anonymous dine-in
          subtotal: subtotalNum.toFixed(2), // DECIMAL -> string
          deliveryFee: deliveryFeeNum.toFixed(2),
          total: totalNum.toFixed(2),
          status: OrderStatus.PENDING,
          address: null,
          paymentMethod: 'ON_SITE',
          note: note ?? null,
        } as any);
        await manager.save(order);

        const oiBatch = lines.map((l) =>
          manager.create(OrderItem, {
            orderId: order.id,
            itemId: l.itemId,
            name: l.name,
            desc: l.desc,
            price: l.price.toFixed(2), // DECIMAL -> string
            quantity: l.quantity,
            note: l.note,
          }),
        );
        await manager.save(oiBatch);
        await this.cartRepo.delete({ sessionId });

        return manager.findOne(Order, { where: { id: order.id } });
      });

      // 4) logs + WS notify admins
      this.logger.info(
        {
          orderId: saved?.id,
          total: saved?.total,
          items: saved?.items?.length,
        },
        'Dine-in order submitted',
      );

      try {
        this.logger.info(
          { event: 'order:created', orderId: saved!.id },
          'about to broadcast',
        );
        console.log(
          '[OrdersService] about to call notifyOrderCreated',
          saved!.id,
        );
        this.ws.notifyOrderCreated({
          id: saved!.id,
          type: 'DINE_IN',
          tableId: null, // populate when you add table tracking
          total: Number(saved!.total),
          count: saved!.items?.length ?? 0,
          status: saved!.status,
          createdAt: saved!.createdAt ?? new Date(),
        });
        console.log('[OrdersService] notifyOrderCreated called', saved!.id);
      } catch (e) {
        this.logger.error({ err: e }, 'broadcast failed (created)');
      }

      return saved!;
    } catch (e: any) {
      this.logger.error(
        { err: { name: e?.name, message: e?.message, stack: e?.stack } },
        'submitDineInFromSession failed',
      );
      throw new InternalServerErrorException('Failed to submit dine-in order');
    }
  }

  // ---------- helper: admin test broadcast ----------
  testBroadcast() {
    try {
      this.logger.info(
        { event: 'order:created', test: true },
        'about to broadcast',
      );
      this.ws.notifyOrderCreated({
        id: 9999,
        type: 'DINE_IN',
        tableId: null,
        total: 12.34,
        count: 2,
        status: OrderStatus.PENDING,
        createdAt: new Date(),
      });
      return { ok: true };
    } catch (e) {
      this.logger.error({ err: e }, 'test broadcast failed');
      return { ok: false };
    }
  }
}
