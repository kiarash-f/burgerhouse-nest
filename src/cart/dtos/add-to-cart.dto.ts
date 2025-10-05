import {
  IsInt,
  IsOptional,
  IsPositive,
  Min,
  IsString,
  MaxLength,
} from 'class-validator';

export class AddToCartDto {
  @IsInt()
  @IsPositive()
  itemId: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number = 1;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
