// src/items/dtos/create-item.dto.ts
import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CreateItemDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  desc?: string;

  @Type(() => Number) // 👈 تبدیل "320000" → 320000
  @IsInt()
  @Min(0, { message: 'price must not be less than 0' })
  price: number;

  @Type(() => Number) // 👈 تبدیل "1" → 1
  @IsInt()
  categoryId: number;

  // اگر می‌خوای از form-data مقدار "true"/"false" بفرستی:
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) =>
    value === 'true' ? true : value === 'false' ? false : value,
  )
  active?: boolean;
  
}
