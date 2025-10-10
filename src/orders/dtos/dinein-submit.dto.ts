import { IsOptional, IsString, MaxLength } from 'class-validator';

export class DineInSubmitDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
