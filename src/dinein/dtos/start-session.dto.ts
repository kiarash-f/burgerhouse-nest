import { IsString } from 'class-validator';

export class StartSessionDto {
  @IsString()
  tt!: string;
}
