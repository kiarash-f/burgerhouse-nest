// src/items/item.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from '../entities/item.entity';
import { Category } from '../entities/category.entity';
import { ItemQueryDto } from './dtos/item-query.dto';
import { toItemDto, toItemDtoArray } from './mappers/item.mapper'; // <-- mapper

@Injectable()
export class ItemService {
  constructor(
    @InjectRepository(Item) private readonly repo: Repository<Item>,
    @InjectRepository(Category) private readonly catRepo: Repository<Category>,
  ) {}

  // CREATE: returns ItemDto
  async create(
    name: string,
    desc: string | undefined,
    price: number,
    image: string | null,
    categoryId: number,
    active = true,
  ) {
    const category = await this.catRepo.findOne({ where: { id: categoryId } });
    if (!category) throw new BadRequestException('Invalid category');

    const entity = this.repo.create({
      name,
      price,
      active,
      category,
      ...(typeof desc === 'string' ? { desc } : {}),
      ...(image ? { image } : {}),
    });

    const saved = await this.repo.save(entity);

    // Re-load with relations so DTO can include them if needed
    const withRels = await this.repo.findOne({
      where: { id: saved.id },
      relations: ['category', 'media'], // <-- remove 'media' if you don’t have it yet
    });

    return toItemDto(withRels ?? saved);
  }

  // READ ONE: returns ItemDto
  async findOne(id: number) {
    const item = await this.repo.findOne({
      where: { id },
      relations: ['category', 'media'], // <-- remove 'media' if not present
    });
    if (!item) throw new NotFoundException('Item not found');
    return toItemDto(item);
  }

  // (Optional) READ ALL (without filters) – returns array of ItemDto
  async findAll() {
    const rows = await this.repo.find({
      order: { createdAt: 'DESC' },
      relations: ['category', 'media'], // <-- remove 'media' if not present
    });
    return toItemDtoArray(rows);
  }

  // QUERY (paged + filters): returns { items: ItemDto[], total, page, pageSize }
  async query(q: ItemQueryDto) {
    const {
      page = 1,
      limit = 12,
      sort = 'createdAt',
      order = 'desc',
      category,
      categoryId,
      search,
      minPrice,
      maxPrice,
      active,
    } = q;

    const take = Math.min(Number(limit ?? 12), 100);
    const currentPage = Math.max(Number(page ?? 1), 1);
    const skip = (currentPage - 1) * take;

    const qb = this.repo
      .createQueryBuilder('i')
      .leftJoinAndSelect('i.category', 'c')
      // If you have a media relation:
      .leftJoinAndSelect('i.media', 'm');

    if (category) qb.andWhere('c.slug = :category', { category });
    if (categoryId) qb.andWhere('c.id = :categoryId', { categoryId });

    if (typeof active !== 'undefined') {
      // active may arrive as string in query dto
      const activeBool =
        typeof active === 'string' ? active === 'true' : Boolean(active);
      qb.andWhere('i.active = :active', { active: activeBool });
    }

    if (search) {
      qb.andWhere('(i.name LIKE :s OR i.desc LIKE :s)', { s: `%${search}%` });
    }

    if (minPrice !== undefined)
      qb.andWhere('i.price >= :minPrice', { minPrice });
    if (maxPrice !== undefined)
      qb.andWhere('i.price <= :maxPrice', { maxPrice });

    const validSort = ['price', 'createdAt'].includes(String(sort))
      ? String(sort)
      : 'createdAt';
    const validOrder = String(order).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    qb.orderBy(`i.${validSort}`, validOrder as 'ASC' | 'DESC')
      .skip(skip)
      .take(take);

    const [rows, total] = await qb.getManyAndCount();

    return {
      items: toItemDtoArray(rows),
      total,
      page: currentPage,
      pageSize: take,
    };
  }

  // UPDATE BASIC: returns ItemDto
  async updateBasic(
    id: number,
    patch: Partial<Item> & { categoryId?: number },
  ) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Item not found');

    if (patch.categoryId) {
      const category = await this.catRepo.findOne({
        where: { id: patch.categoryId },
      });
      if (!category) throw new BadRequestException('Invalid category');
      (item as any).category = category;
      delete (patch as any).categoryId;
    }

    Object.assign(item, patch);
    await this.repo.save(item);

    const updated = await this.repo.findOne({
      where: { id },
      relations: ['category', 'media'], // <-- remove 'media' if not present
    });
    if (!updated) throw new NotFoundException('Item not found');

    return toItemDto(updated);
  }

  // DELETE: returns success object
  async remove(id: number) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Item not found');
    await this.repo.remove(item);
    return { success: true };
  }
}
