import { plainToInstance } from 'class-transformer';
import { User } from '../../entities/user.entity';
import { UserDto } from './user.dto';

export function toUserDto(user: User): UserDto {
  return plainToInstance(UserDto, user, { excludeExtraneousValues: true });
}

export const toUserDtoArray = (arr: User[]) => arr.map(toUserDto);
