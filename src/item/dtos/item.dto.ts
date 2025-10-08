// src/items/dtos/item.dto.ts
import { Expose, Type } from 'class-transformer';

export class MediaVariantsDto {
  @Expose() url!: string;
}
export class MediaDto {
  @Expose() id!: string;
  @Expose() @Type(() => MediaVariantsDto) thumb?: MediaVariantsDto;
  @Expose() @Type(() => MediaVariantsDto) sm?: MediaVariantsDto;
  @Expose() @Type(() => MediaVariantsDto) md?: MediaVariantsDto;
  @Expose() @Type(() => MediaVariantsDto) lg?: MediaVariantsDto;
}

export class ItemDto {
  @Expose() id!: number;
  @Expose() name!: string;
  @Expose() desc?: string;
  @Expose() price!: number;
  @Expose() image!: string;
  @Expose() @Type(() => MediaDto) media?: {
    id: string;
    variants: {
      thumb?: { url: string };
      sm?: { url: string };
      md?: { url: string };
      lg?: { url: string };
    };
  };
  @Expose() active!: boolean;
  @Expose() categoryId!: number | null;

  @Expose() createdAt!: Date;
}
