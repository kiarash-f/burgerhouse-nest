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

@Injectable()
export class ItemService {
  constructor(
    @InjectRepository(Item) private repo: Repository<Item>,
    @InjectRepository(Category) private catRepo: Repository<Category>,
  ) {}

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

    const item = this.repo.create({
      name,
      price,
      active,
      category,
      // ⬇️ فقط اگر مقدار دارند ست کن
      ...(typeof desc === 'string' ? { desc } : {}),
      ...(image ? { image } : {}),
    });

    return this.repo.save(item);
  }

  async findOne(id: number) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Item not found');
    return item;
  }

  findAll() {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

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

    const qb = this.repo
      .createQueryBuilder('i')
      .leftJoinAndSelect('i.category', 'c');

    if (category) qb.andWhere('c.slug = :category', { category });
    if (categoryId) qb.andWhere('c.id = :categoryId', { categoryId });

    if (typeof active !== 'undefined')
      qb.andWhere('i.active = :active', { active: active === 'true' });

    if (search) {
      qb.andWhere('(i.name LIKE :s OR i.desc LIKE :s)', { s: `%${search}%` });
    }

    if (minPrice) qb.andWhere('i.price >= :minPrice', { minPrice });
    if (maxPrice) qb.andWhere('i.price <= :maxPrice', { maxPrice });

    const validSort = ['price', 'createdAt'].includes(sort)
      ? sort
      : 'createdAt';
    const validOrder = order?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    qb.orderBy(`i.${validSort}`, validOrder as 'ASC' | 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit };
  }

  async updateBasic(
    id: number,
    patch: Partial<Item> & { categoryId?: number },
  ) {
    const item = await this.findOne(id);

    if (patch.categoryId) {
      const category = await this.catRepo.findOne({
        where: { id: patch.categoryId },
      });
      if (!category) throw new BadRequestException('Invalid category');
      item.category = category;
      delete (patch as any).categoryId;
    }

    Object.assign(item, patch);
    return this.repo.save(item);
  }

  async remove(id: number) {
    const item = await this.findOne(id);
    await this.repo.remove(item);
    return { success: true };
  }
}
