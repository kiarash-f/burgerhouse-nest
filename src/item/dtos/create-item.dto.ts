import { IsString, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateItemDto {
  @IsString()
  name: string;

  @IsString()
  desc: string;
  @Type(() => Number)
  @IsNumber()
  price: number;

  @IsOptional()
  @IsString()
  image?: string;
}
