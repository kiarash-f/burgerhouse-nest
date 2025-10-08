// src/menu/menu.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../entities/category.entity';
import { MenuCategoryDto, MenuItemDto } from './dtos/menu.dto';
import { MenuQueryDto } from './dtos/menu-query.dto';
import { plainToInstance } from 'class-transformer';

@Controller('menu')
export class MenuController {
  constructor(
    @InjectRepository(Category)
    private readonly catRepo: Repository<Category>,
  ) {}

  private normalizeImageUrl(raw?: string | null): string {
    if (!raw) return '';
    if (/^https?:\/\//i.test(raw)) return raw; // already absolute (Cloudinary or served)
    const base =
      process.env.APP_PUBLIC_UPLOADS_BASE ||
      `${(process.env.APP_URL || 'http://localhost:3000').replace(/\/$/, '')}/uploads`;
    return `${base}/${raw}`;
  }

  @Get()
  async getMenu(@Query() q: MenuQueryDto) {
    const includeEmpty =
      q.includeEmpty === 'true'
        ? true
        : q.includeEmpty === 'false'
          ? false
          : false;

    // Pull categories with ONLY active items
    // Note: We join media if available, but it's okay if you didn't add that relation
    const qb = this.catRepo
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.items', 'i', 'i.active = :active', { active: true })
      .leftJoinAndSelect('i.media', 'm') // safe even if media is nullable
      .orderBy('c.id', 'ASC')
      .addOrderBy('i.price', 'ASC');

    if (q.category) qb.andWhere('c.slug = :slug', { slug: q.category });
    if (q.categoryId) qb.andWhere('c.id = :cid', { cid: q.categoryId });

    if (q.search) {
      qb.andWhere('(i.name LIKE :s OR i.desc LIKE :s)', { s: `%${q.search}%` });
    }
    if (q.minPrice !== undefined)
      qb.andWhere('i.price >= :minPrice', { minPrice: q.minPrice });
    if (q.maxPrice !== undefined)
      qb.andWhere('i.price <= :maxPrice', { maxPrice: q.maxPrice });

    const categories = await qb.getMany();

    // Optionally hide empty categories
    const filtered = includeEmpty
      ? categories
      : categories.filter(
          (c: any) => Array.isArray(c.items) && c.items.length > 0,
        );

    // Map to DTOs with clean fields
    const payload = filtered.map((c: any) => {
      const items = (c.items || []).map((i: any) => {
        const image =
          i?.media?.variants?.md?.url ||
          i?.media?.variants?.sm?.url ||
          this.normalizeImageUrl(i.image);

        const dto: MenuItemDto = {
          id: i.id,
          name: i.name,
          desc: i.desc ?? null,
          price: i.price,
          image,
          categoryId: c.id,
        };
        return plainToInstance(MenuItemDto, dto, {
          excludeExtraneousValues: true,
        });
      });

      const catDto: MenuCategoryDto = {
        id: c.id,
        name: c.name,
        slug: c.slug,
        items,
      };
      return plainToInstance(MenuCategoryDto, catDto, {
        excludeExtraneousValues: true,
      });
    });

    return { categories: payload };
  }
}
