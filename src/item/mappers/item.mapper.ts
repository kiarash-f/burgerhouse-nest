// src/items/mappers/item.mapper.ts
import { plainToInstance } from 'class-transformer';
import { ItemDto } from '../dtos/item.dto';

type MediaLike = { id: string; variants?: any } | null | undefined;
type CategoryLike = { id: number } | null | undefined;

type ItemLike = {
  id: number;
  name: string;
  desc?: string | null;
  price: number;
  image?: string | null;
  active?: boolean;
  category?: CategoryLike;
  categoryId?: number;
  createdAt?: Date;
  updatedAt?: Date;
  media?: MediaLike;
};

function normalizeImageUrl(raw?: string | null): string {
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw)) return raw; // already Cloudinary or absolute
  const base =
    process.env.APP_PUBLIC_UPLOADS_BASE || // set this if you want, e.g. https://api.example.com/uploads
    `${(process.env.APP_URL || 'http://localhost:3000').replace(/\/$/, '')}/uploads`;
  return `${base}/${raw}`;
}

export function toItemDto(entity: ItemLike): ItemDto {
  const media = entity.media as any;

  // Prefer Cloudinary (media variants) → fallback to legacy image filename (normalized to absolute URL)
  const preferredImage =
    media?.variants?.md?.url ??
    media?.variants?.sm?.url ??
    normalizeImageUrl(entity.image);

  const derivedCategoryId =
    (entity as any).category?.id ?? (entity as any).categoryId ?? null;

  const shaped = {
    id: entity.id,
    name: entity.name,
    desc: entity.desc ?? undefined,
    price: entity.price,
    image: preferredImage,
    media: media ? { id: media.id, variants: media.variants } : undefined,
    active: entity.active ?? true,
    categoryId: derivedCategoryId,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  };

  return plainToInstance(ItemDto, shaped, { excludeExtraneousValues: true });
}

export function toItemDtoArray(items: ItemLike[]): ItemDto[] {
  return items.map(toItemDto);
}
