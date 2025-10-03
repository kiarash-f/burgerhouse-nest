import { Expose } from 'class-transformer';

export class UserDto {
  @Expose()
  id: number;
  @Expose()
  email: string;
  @Expose()
  name: string;
  @Expose()
  lastname: string;
  // @Expose()
  // token: string;
  @Expose()
  mobile: string;
  @Expose()
  address?: string;
  @Expose() createdAt: Date;
  @Expose() updatedAt: Date;
}
