// src/users/users.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { toUserDto, toUserDtoArray } from './dtos/to-user-dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() dto: CreateUserDto) {
    const user = await this.usersService.create(dto);
    return toUserDto(user);
  }

  @Get()
  async findAll() {
    const users = await this.usersService.findAll();
    return toUserDtoArray(users);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOne(+id);
    return toUserDto(user);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    const updatedUser = await this.usersService.update(+id, dto);
    return toUserDto(updatedUser);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
  @Patch(':id/promote')
  promoteToAdmin(@Param('id') id: string) {
    return this.usersService.promoteToAdmin(+id);
  }
}
