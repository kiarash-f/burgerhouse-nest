// src/menu/dtos/menu.dto.ts
import { Expose, Type } from 'class-transformer';

export class MenuItemDto {
  @Expose() id!: number;
  @Expose() name!: string;
  @Expose() desc?: string | null;
  @Expose() price!: number;
  @Expose() image!: string;
  @Expose() categoryId!: number;
}

export class MenuCategoryDto {
  @Expose() id!: number;
  @Expose() name!: string;
  @Expose() slug!: string;
  @Expose() @Type(() => MenuItemDto) items!: MenuItemDto[];
}
