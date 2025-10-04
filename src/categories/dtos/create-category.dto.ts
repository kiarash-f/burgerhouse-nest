import { IsInt, IsOptional, IsString, Matches } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  name: string;

  @IsString()
  @Matches(/^[a-z0-9-]+$/, {
    message: 'slug must be lowercase, digits, or hyphen',
  })
  slug: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
