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

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem) private readonly repo: Repository<CartItem>,
    @InjectRepository(Item) private readonly itemsRepo: Repository<Item>,
  ) {}

  async list(userId: number) {
    const rows = await this.repo.find({
      where: { userId },
      order: { createdAt: 'ASC' },
      // if not eager on relation, add: relations: ['item'],
    });

    const items = rows.map((r) => ({
      id: r.id,
      itemId: r.itemId,
      quantity: r.quantity,
      note: r.note ?? null,
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

  async add(userId: number, dto: AddToCartDto) {
    const item = await this.itemsRepo.findOne({ where: { id: dto.itemId } });
    if (!item) throw new NotFoundException('Item not found');

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
      itemId: dto.itemId,
      quantity: dto.quantity ?? 1,
      note: dto.note,
    });
    return this.repo.save(created);
  }

  async update(userId: number, id: number, patch: UpdateCartItemDto) {
    const row = await this.repo.findOne({ where: { id, userId } });
    if (!row) throw new NotFoundException('Cart item not found');

    if (patch.quantity !== undefined) {
      if (patch.quantity < 1)
        throw new BadRequestException('Quantity must be >= 1');
      row.quantity = patch.quantity;
    }
    if (patch.note !== undefined) {
      row.note = patch.note;
    }

    return this.repo.save(row);
  }

  async remove(userId: number, id: number) {
    const result = await this.repo.delete({ id, userId });
    if (result.affected === 0)
      throw new NotFoundException('Cart item not found');
    return { success: true };
  }

  async clear(userId: number) {
    await this.repo.delete({ userId });
    return { success: true };
  }
}
