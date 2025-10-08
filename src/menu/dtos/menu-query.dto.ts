// src/menu/dtos/menu-query.dto.ts
import { IsBooleanString, IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class MenuQueryDto {
  @IsOptional() @IsString() category?: string; // slug
  @IsOptional() @Type(() => Number) @IsInt() categoryId?: number;
  @IsOptional() @IsString() search?: string;
  @IsOptional() @Type(() => Number) minPrice?: number;
  @IsOptional() @Type(() => Number) maxPrice?: number;
  @IsOptional() @IsBooleanString() includeEmpty?: string;
}
