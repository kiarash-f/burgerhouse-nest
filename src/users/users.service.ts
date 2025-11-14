// src/users/users.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../users/dtos/create-user.dto';
import { UpdateUserDto } from '../users/dtos/update-user.dto';
export type UserWithPassword = User & { password: string | null };

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private repo: Repository<User>,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const user = this.repo.create({ ...dto, role: 'USER' });
    return await this.repo.save(user);
  }
  async findAll(): Promise<User[]> {
    return await this.repo.find();
  }
  async findOne(id: number): Promise<User> {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
  async findByEmail(email: string): Promise<User | null> {
    return await this.repo.findOne({ where: { email } });
  }
  async update(id: number, dto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    Object.assign(user, dto);
    return this.repo.save(user);
  }
  async remove(id: number): Promise<void> {
    await this.repo.delete(id);
  }
  async findByProvider(
    provider: string,
    providerId: string,
  ): Promise<User | null> {
    return await this.repo.findOne({ where: { provider, providerId } });
  }
  async createOAuthUser(
    provider: string,
    providerId: string,
    email: string,
    name: string,
    lastname: string,
  ): Promise<User> {
    const user = this.repo.create({
      provider,
      providerId,
      email,
      name,
      lastname,
      mobile: '',
      role: 'USER',
    });
    return this.repo.save(user);
  }
  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.repo
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();
  }
  async promoteToAdmin(userId: number): Promise<User> {
    const user = await this.repo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    user.role = 'ADMIN';
    return this.repo.save(user);
  }
}
