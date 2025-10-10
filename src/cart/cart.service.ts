// src/cart/cart.service.ts
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from '../entities/cart-item.entity';
import { AddToCartDto } from './dtos/add-to-cart.dto';
import { UpdateCartItemDto } from './dtos/update-cart-item.dto';
import { Item } from '../entities/item.entity';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem) private readonly repo: Repository<CartItem>,
    @InjectRepository(Item) private readonly itemsRepo: Repository<Item>,
    @InjectPinoLogger(CartService.name) private readonly logger: PinoLogger,
  ) {}

  // ---------- helpers ----------
  private mapRows(rows: CartItem[]) {
    const items = rows.map((r) => ({
      id: r.id,
      itemId: r.itemId,
      quantity: r.quantity,
      note: r.note ?? null,
      // expect r.item relation to be present; if not eager, add relations: ['item'] in find()
      item: {
        id: r.item.id,
        name: (r.item as any).name,
        desc: (r.item as any).desc ?? null,
        price: (r.item as any).price,
        image: (r.item as any).image ?? null,
        categoryId: (r.item as any).categoryId ?? null,
      },
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));

    const totals = items.reduce(
      (acc, row) => {
        acc.count += 1;
        acc.qty += row.quantity;
        acc.amount += row.quantity * Number(row.item.price);
        return acc;
      },
      { count: 0, qty: 0, amount: 0 },
    );

    return { items, totals };
  }

  private async ensureItem(id: number) {
    const item = await this.itemsRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Item not found');
    if (item.active === false)
      throw new BadRequestException('Item unavailable');
    return item;
  }

  // ---------- USER CART (by userId) ----------
  async list(userId: number) {
    this.logger.debug({ userId }, 'List user cart');
    const rows = await this.repo.find({
      where: { userId },
      order: { createdAt: 'ASC' },
      relations: ['item'],
    });
    return this.mapRows(rows);
  }

  async add(userId: number, dto: AddToCartDto) {
    this.logger.debug({ userId, itemId: dto.itemId }, 'Add to user cart');
    await this.ensureItem(dto.itemId);

    // merge with existing (unique userId+itemId)
    const existing = await this.repo.findOne({
      where: { userId, itemId: dto.itemId },
    });
    if (existing) {
      existing.quantity += dto.quantity ?? 1;
      if (dto.note !== undefined) existing.note = dto.note;
      return this.repo.save(existing);
    }

    const created = this.repo.create({
      userId,
      sessionId: null,
      itemId: dto.itemId,
      quantity: dto.quantity ?? 1,
      note: dto.note,
    });
    return this.repo.save(created);
  }

  async update(userId: number, id: number, patch: UpdateCartItemDto) {
    this.logger.debug({ userId, id }, 'Update user cart item');
    const row = await this.repo.findOne({ where: { id, userId } });
    if (!row) throw new NotFoundException('Cart item not found');

    if (patch.quantity !== undefined) {
      if (patch.quantity < 1)
        throw new BadRequestException('Quantity must be >= 1');
      row.quantity = patch.quantity;
    }
    if (patch.note !== undefined) row.note = patch.note;

    return this.repo.save(row);
  }

  async remove(userId: number, id: number) {
    this.logger.debug({ userId, id }, 'Remove user cart item');
    const result = await this.repo.delete({ id, userId });
    if (result.affected === 0)
      throw new NotFoundException('Cart item not found');
    return { success: true };
  }

  async clear(userId: number) {
    this.logger.debug({ userId }, 'Clear user cart');
    await this.repo.delete({ userId });
    return { success: true };
  }

  // ---------- DINE-IN CART (by sessionId) ----------
  async listBySession(sessionId: string) {
    this.logger.debug({ sessionId }, 'List dine-in cart');
    const rows = await this.repo.find({
      where: { sessionId },
      order: { createdAt: 'ASC' },
      relations: ['item'],
    });
    return this.mapRows(rows);
  }

  async addBySession(sessionId: string, dto: AddToCartDto) {
    this.logger.debug({ sessionId, itemId: dto.itemId }, 'Add to dine-in cart');
    await this.ensureItem(dto.itemId);

    const existing = await this.repo.findOne({
      where: { sessionId, itemId: dto.itemId },
    });
    if (existing) {
      existing.quantity += dto.quantity ?? 1;
      if (dto.note !== undefined) existing.note = dto.note;
      return this.repo.save(existing);
    }

    const created = this.repo.create({
      userId: null,
      sessionId,
      itemId: dto.itemId,
      quantity: dto.quantity ?? 1,
      note: dto.note,
    });
    return this.repo.save(created);
  }

  async updateBySession(
    sessionId: string,
    id: number,
    patch: UpdateCartItemDto,
  ) {
    this.logger.debug({ sessionId, id }, 'Update dine-in cart item');
    const row = await this.repo.findOne({ where: { id, sessionId } });
    if (!row) throw new NotFoundException('Cart item not found');

    if (patch.quantity !== undefined) {
      if (patch.quantity < 1)
        throw new BadRequestException('Quantity must be >= 1');
      row.quantity = patch.quantity;
    }
    if (patch.note !== undefined) row.note = patch.note;

    return this.repo.save(row);
  }

  async removeBySession(sessionId: string, id: number) {
    this.logger.debug({ sessionId, id }, 'Remove dine-in cart item');
    const result = await this.repo.delete({ id, sessionId });
    if (result.affected === 0)
      throw new NotFoundException('Cart item not found');
    return { success: true };
  }

  async clearBySession(sessionId: string) {
    this.logger.debug({ sessionId }, 'Clear dine-in cart');
    await this.repo.delete({ sessionId });
    return { success: true };
  }
}
